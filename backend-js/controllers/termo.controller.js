const { validationResult } = require('express-validator');
const Termo = require('../models/termo.model');


// Criar novo termo
const create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nome, sobrenome, email, equipamento, status } = req.body;
    const termo = await Termo.create({
      nome,
      sobrenome,
      email,
      equipamento,
      status: status || 'pendente'
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
  try {
    const termo = await Termo.findByPk(req.params.id);
    if (!termo) {
      return res.status(404).json({ message: 'Termo não encontrado' });
    }
    res.json(termo);
  } catch (error) {
    console.error('Erro ao buscar termo:', error);
    res.status(500).json({ message: 'Erro ao buscar termo' });
  }
};

// Atualizar termo
const update = async (req, res) => {
  try {
    const { nome, sobrenome, email, equipamento, status } = req.body;
    const termo = await Termo.findByPk(req.params.id);
    
    if (!termo) {
      return res.status(404).json({ message: 'Termo não encontrado' });
    }

    await termo.update({
      nome,
      sobrenome,
      email,
      equipamento,
      status
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

module.exports = {
  create,
  list,
  getById,
  update,
  remove
};
