const Termo = require('../models/Termo');
const { generateTermoRecebimento } = require('../services/pdfService');
const config = require('../config/config');

const TermoController = {
  // Criar novo termo
  async criar(req, res) {
    try {
      const urlGerada = config.getFullUrl(`/assinar/${req.body.id}`);
      console.log('URL gerada:', urlGerada);
      
      const termo = await Termo.create({
        ...req.body,
        urlAcesso: urlGerada
      });

      return res.status(201).json(termo);
    } catch (error) {
      console.error('Erro ao criar termo:', error);
      return res.status(500).json({ error: 'Erro ao criar termo' });
    }
  },

  // Buscar termo por ID
  async buscarPorId(req, res) {
    try {
      const termo = await Termo.findByPk(req.params.id);
      
      if (!termo) {
        return res.status(404).json({ error: 'Termo não encontrado' });
      }

      return res.json(termo);
    } catch (error) {
      console.error('Erro ao buscar termo:', error);
      return res.status(500).json({ error: 'Erro ao buscar termo' });
    }
  },

  // Buscar termo por URL de acesso
  async buscarPorUrlAcesso(req, res) {
    try {
      const termo = await Termo.findOne({
        where: { urlAcesso: req.params.urlAcesso }
      });
      if (!termo) {
        return res.status(404).json({ error: 'Termo não encontrado' });
      }
      return res.json(termo);
    } catch (error) {
      console.error('Erro ao buscar termo:', error);
      return res.status(500).json({ error: 'Erro ao buscar termo' });
    }
  },

  // Listar todos os termos
  async listar(req, res) {
    try {
      console.log('Requisição recebida para listar termos');
      const termos = await Termo.findAll();
      console.log('Termos encontrados:', termos.length);
      return res.json(termos);
    } catch (error) {
      console.error('Erro ao listar termos:', error);
      return res.status(500).json({ error: 'Erro ao listar termos' });
    }
  },

  // Atualizar status do termo
  async atualizarStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, assinatura } = req.body;

      const termo = await Termo.findByPk(id);

      if (!termo) {
        return res.status(404).json({ error: 'Termo não encontrado' });
      }

      await termo.update({ status, assinatura });
      return res.json(termo);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      return res.status(500).json({ error: 'Erro ao atualizar status' });
    }
  },

  // Excluir termo
  async excluir(req, res) {
    try {
      const { id } = req.params;
      const termo = await Termo.findByPk(id);

      if (!termo) {
        return res.status(404).json({ error: 'Termo não encontrado' });
      }

      await termo.destroy();
      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao excluir termo:', error);
      return res.status(500).json({ error: 'Erro ao excluir termo' });
    }
  },

  // Gerar e baixar PDF do termo
  async downloadPDF(req, res) {
    try {
      const { id } = req.params;
      const termo = await Termo.findOne({
        where: {
          id: id
        }
      });
      
      if (!termo) {
        return res.status(404).json({ error: 'Termo não encontrado' });
      }

      const pdfDoc = await generateTermoRecebimento({
        nome: termo.nome,
        sobrenome: termo.sobrenome,
        email: termo.email,
        equipamento: termo.equipamento,
        assinatura: termo.assinatura,
        data: termo.createdAt.toLocaleDateString('pt-BR')
      });

      const pdfBytes = pdfDoc.output('arraybuffer');

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=termo-${termo.nome.toLowerCase()}-${termo.id}.pdf`);
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      return res.status(500).json({ error: 'Erro ao gerar PDF do termo' });
    }
  }
};

module.exports = { TermoController }; 