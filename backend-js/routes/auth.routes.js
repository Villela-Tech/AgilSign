const { Router } = require('express');
const { body } = require('express-validator');
const { register, login, logout } = require('../controllers/auth.controller');

const router = Router();

// Validação para registro
const registerValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('A senha deve ter no mínimo 6 caracteres'),
];

// Validação para login
const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
];

// Rotas
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', logout);

module.exports = router; 