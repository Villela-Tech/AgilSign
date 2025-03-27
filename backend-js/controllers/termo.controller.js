const { validationResult } = require('express-validator');
const crypto = require('crypto');
const Termo = require('../models/termo.model');

// Gerar URL de acesso única
const gerarUrlAcesso = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Criar novo termo
const create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nome, sobrenome, email, equipamento, status } = req.body;
    const urlAcesso = gerarUrlAcesso();

    const termo = await Termo.create({
      nome,
      sobrenome,
      email,
      equipamento,
      status: status || 'pendente',
      urlAcesso
    });

    res.status(201).json({
      message: 'Termo criado com sucesso',
      termo
    });
  } catch (error) {
    console.error('Erro ao criar termo:', error);
    res.status(500).json({ message: 'Erro ao criar termo' });
  }
};

// Listar todos os termos
const list = async (req, res) => {
  try {
    const termos = await Termo.findAll();
    res.json(termos);
  } catch (error) {
    console.error('Erro ao listar termos:', error);
    res.status(500).json({ message: 'Erro ao listar termos' });
  }
};

// Buscar termo por ID
const getById = async (req, res) => {
  console.log('Recebida requisição para buscar termo por ID:', req.params.id);
  try {
    const termo = await Termo.findByPk(req.params.id);
    if (!termo) {
      console.log('Termo não encontrado para o ID:', req.params.id);
      return res.status(404).json({ message: 'Termo não encontrado' });
    }
    console.log('Termo encontrado:', termo.id);
    res.json(termo);
  } catch (error) {
    console.error('Erro ao buscar termo:', error);
    res.status(500).json({ message: 'Erro ao buscar termo' });
  }
};

// Buscar termo por URL de acesso
const getByUrl = async (req, res) => {
  console.log('Recebida requisição para buscar termo por URL de acesso');
  console.log('URL de acesso recebida:', req.params.urlAcesso);
  
  try {
    if (!req.params.urlAcesso) {
      console.log('URL de acesso não fornecida');
      return res.status(400).json({ message: 'URL de acesso não fornecida' });
    }

    const termo = await Termo.findOne({
      where: { urlAcesso: req.params.urlAcesso }
    });
    
    if (!termo) {
      console.log('Termo não encontrado para a URL:', req.params.urlAcesso);
      return res.status(404).json({ message: 'Termo não encontrado' });
    }

    console.log('Termo encontrado com sucesso:', { id: termo.id, status: termo.status });
    res.json(termo);
  } catch (error) {
    console.error('Erro ao buscar termo por URL:', error);
    res.status(500).json({ message: 'Erro ao buscar termo' });
  }
};

// Assinar termo
const sign = async (req, res) => {
  console.log('Recebida requisição para assinar termo');
  console.log('URL de acesso recebida:', req.params.urlAcesso);
  
  try {
    if (!req.params.urlAcesso) {
      console.log('URL de acesso não fornecida para assinatura');
      return res.status(400).json({ message: 'URL de acesso não fornecida' });
    }

    const { assinatura } = req.body;
    console.log('Buscando termo para assinatura com URL:', req.params.urlAcesso);

    const termo = await Termo.findOne({
      where: { urlAcesso: req.params.urlAcesso }
    });
    
    if (!termo) {
      console.log('Termo não encontrado para assinatura. URL:', req.params.urlAcesso);
      return res.status(404).json({ message: 'Termo não encontrado' });
    }

    if (termo.status === 'assinado') {
      console.log('Tentativa de assinar termo já assinado. ID:', termo.id);
      return res.status(400).json({ message: 'Termo já foi assinado' });
    }

    console.log('Atualizando termo com assinatura. ID:', termo.id);
    await termo.update({
      assinatura,
      status: 'assinado'
    });

    console.log('Termo assinado com sucesso. ID:', termo.id);
    res.json({
      message: 'Termo assinado com sucesso',
      termo
    });
  } catch (error) {
    console.error('Erro ao assinar termo:', error);
    res.status(500).json({ message: 'Erro ao assinar termo' });
  }
};

// Atualizar termo
const update = async (req, res) => {
  try {
    const { nome, sobrenome, email, equipamento, status, assinatura } = req.body;
    const termo = await Termo.findByPk(req.params.id);
    
    if (!termo) {
      return res.status(404).json({ message: 'Termo não encontrado' });
    }

    await termo.update({
      nome,
      sobrenome,
      email,
      equipamento,
      status,
      assinatura
    });

    res.json({
      message: 'Termo atualizado com sucesso',
      termo
    });
  } catch (error) {
    console.error('Erro ao atualizar termo:', error);
    res.status(500).json({ message: 'Erro ao atualizar termo' });
  }
};

// Deletar termo
const remove = async (req, res) => {
  try {
    const termo = await Termo.findByPk(req.params.id);
    if (!termo) {
      return res.status(404).json({ message: 'Termo não encontrado' });
    }

    await termo.destroy();
    res.json({ message: 'Termo removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover termo:', error);
    res.status(500).json({ message: 'Erro ao remover termo' });
  }
};

// Download do PDF do termo
const downloadPDF = async (req, res) => {
  console.log('Recebida requisição para download do PDF. ID:', req.params.id);
  try {
    const termo = await Termo.findByPk(req.params.id);
    if (!termo) {
      console.log('Termo não encontrado para o ID:', req.params.id);
      return res.status(404).json({ message: 'Termo não encontrado' });
    }

    console.log('Termo encontrado, gerando PDF...');
    console.log('Dados do termo:', {
      id: termo.id,
      nome: termo.nome,
      sobrenome: termo.sobrenome,
      status: termo.status,
      temAssinatura: !!termo.assinatura
    });

    // Gerar o PDF
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();

    // Configurar headers para download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=termo-${termo.id}.pdf`);

    // Pipe o PDF direto para a resposta
    doc.pipe(res);

    // Adicionar conteúdo ao PDF
    doc.fontSize(16).text('Termo de Compromisso', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Nome: ${termo.nome} ${termo.sobrenome}`);
    doc.moveDown();
    doc.text(`Email: ${termo.email}`);
    doc.moveDown();
    doc.text(`Equipamento: ${termo.equipamento}`);
    doc.moveDown();
    doc.text(`Status: ${termo.status}`);
    
    if (termo.assinatura) {
      console.log('Adicionando assinatura ao PDF...');
      doc.moveDown();
      doc.text('Assinatura:');
      try {
        const assinaturaBase64 = termo.assinatura.split(',')[1];
        console.log('Base64 da assinatura extraído');
        const assinaturaBuffer = Buffer.from(assinaturaBase64, 'base64');
        console.log('Buffer da assinatura criado');
        doc.image(assinaturaBuffer, {
          fit: [200, 100],
          align: 'center'
        });
        console.log('Assinatura adicionada ao PDF');
      } catch (err) {
        console.error('Erro ao adicionar assinatura:', err);
      }
    }

    // Finalizar o PDF
    console.log('Finalizando PDF...');
    doc.end();
    console.log('PDF gerado com sucesso');
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ message: 'Erro ao gerar PDF', error: error.message });
  }
};

// Listar termos por responsável
const listByResponsavel = async (req, res) => {
  try {
    const responsavelId = req.params.responsavelId;
    console.log('Listando termos para o responsável:', responsavelId);
    
    const termos = await Termo.findAll({
      where: { responsavel_id: responsavelId }
    });
    
    console.log(`Encontrados ${termos.length} termos para o responsável ${responsavelId}`);
    res.json(termos);
  } catch (error) {
    console.error('Erro ao listar termos por responsável:', error);
    res.status(500).json({ message: 'Erro ao listar termos por responsável' });
  }
};

module.exports = {
  create,
  list,
  getById,
  getByUrl,
  sign,
  update,
  remove,
  downloadPDF,
  listByResponsavel
};
