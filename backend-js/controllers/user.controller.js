const { validationResult } = require('express-validator');
const User = require('../models/user.model');

/**
 * Listar todos os usuários
 */
const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await User.findAll({
      attributes: { exclude: ['password'] } // Não retornar a senha
    });
    res.json(usuarios);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ message: 'Erro ao listar usuários' });
  }
};

/**
 * Buscar usuário por ID
 */
const buscarUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Apenas administradores ou o próprio usuário podem ver os detalhes
    if (req.user.role !== 'admin' && req.user.id != id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    const usuario = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.json(usuario);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
};

/**
 * Criar um novo usuário
 */
const criarUsuario = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    // Verificar se o usuário já existe
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'Este email já está em uso' });
    }

    // Criar novo usuário
    const usuario = await User.create({
      name,
      email,
      password, // A senha será criptografada automaticamente pelo hook do modelo
      role: role || 'user' // Se não especificado, o papel será 'user'
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
        role: usuario.role,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt
      }
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro ao criar usuário' });
  }
};

/**
 * Atualizar um usuário existente
 */
const atualizarUsuario = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, email, password, role } = req.body;
    
    // Buscar o usuário
    const usuario = await User.findByPk(id);
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Verificar permissões: apenas administradores podem alterar papel ou dados de outros usuários
    if (req.user.role !== 'admin' && req.user.id != id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    // Verificar se o email já está em uso por outro usuário
    if (email && email !== usuario.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ message: 'Este email já está em uso' });
      }
    }
    
    // Administradores podem alterar o papel do usuário, mas não podem rebaixar a si mesmos
    if (role && req.user.role === 'admin' && req.user.id == id && role !== 'admin') {
      return res.status(400).json({ 
        message: 'Administradores não podem rebaixar a si mesmos' 
      });
    }
    
    // Usuários normais não podem alterar seu próprio papel
    if (role && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Apenas administradores podem alterar o papel do usuário' 
      });
    }
    
    // Atualizar dados
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (role && req.user.role === 'admin') updateData.role = role;
    
    await usuario.update(updateData);
    
    res.json({
      message: 'Usuário atualizado com sucesso',
      user: {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
        role: usuario.role,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
};

/**
 * Excluir um usuário
 */
const excluirUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar o usuário
    const usuario = await User.findByPk(id);
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Impedir que um administrador exclua a si próprio
    if (req.user.id == id) {
      return res.status(400).json({ message: 'Você não pode excluir sua própria conta' });
    }
    
    // Executar a exclusão
    await usuario.destroy();
    
    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ message: 'Erro ao excluir usuário' });
  }
};

module.exports = {
  listarUsuarios,
  buscarUsuarioPorId,
  criarUsuario,
  atualizarUsuario,
  excluirUsuario
}; 