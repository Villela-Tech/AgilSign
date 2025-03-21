const express = require('express');
const router = express.Router();
const termoController = require('../controllers/termo.controller');
const { check } = require('express-validator');

// Validação para criação/atualização de termo
const termoValidation = [
  check('nome').notEmpty().withMessage('Nome é obrigatório'),
  check('sobrenome').notEmpty().withMessage('Sobrenome é obrigatório'),
  check('email').isEmail().withMessage('Email inválido'),
  check('equipamento').notEmpty().withMessage('Equipamento é obrigatório'),
  check('status').optional().isIn(['pendente', 'assinado', 'cancelado']).withMessage('Status inválido')
];

// Criar novo termo
router.post('/', termoValidation, termoController.create);

// Listar todos os termos
router.get('/', termoController.list);

// Buscar termo por ID
router.get('/:id', termoController.getById);

// Atualizar termo
router.put('/:id', termoValidation, termoController.update);

// Deletar termo
router.delete('/:id', termoController.remove);

module.exports = router;