const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Middleware que verifica se o usuário é administrador
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Permissão de administrador necessária.' });
  }
  next();
};

// Validação para criação e atualização de usuário
const userValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('A senha deve ter no mínimo 6 caracteres'),
  body('role').optional().isIn(['admin', 'user']).withMessage('O perfil deve ser admin ou user'),
];

// Rota para listar todos os usuários (apenas admin)
router.get('/', authMiddleware, isAdmin, userController.listarUsuarios);

// Rota para buscar um usuário específico pelo ID
router.get('/:id', authMiddleware, userController.buscarUsuarioPorId);

// Rota para criar um novo usuário (apenas admin)
router.post('/', [authMiddleware, isAdmin, ...userValidation], userController.criarUsuario);

// Rota para atualizar um usuário
router.put('/:id', [authMiddleware, ...userValidation], userController.atualizarUsuario);

// Rota para excluir um usuário (apenas admin)
router.delete('/:id', authMiddleware, isAdmin, userController.excluirUsuario);

module.exports = router; 