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

// Validação para assinatura
const assinaturaValidation = [
  check('assinatura').notEmpty().withMessage('Assinatura é obrigatória')
];

// Criar novo termo
router.post('/', termoValidation, termoController.create);

// Listar todos os termos
router.get('/', termoController.list);

// Buscar termo por URL de acesso
router.get('/acesso/:urlAcesso', termoController.getByUrl);

// Assinar termo
router.post('/assinar/:urlAcesso', assinaturaValidation, termoController.sign);

// Buscar termo por ID
router.get('/:id', termoController.getById);

// Download do PDF do termo
router.get('/:id/pdf', termoController.downloadPDF);

// Atualizar termo
router.put('/:id', termoValidation, termoController.update);

// Deletar termo
router.delete('/:id', termoController.remove);

module.exports = router;