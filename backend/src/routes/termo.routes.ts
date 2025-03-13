import { Router } from 'express';
import { TermoController } from '../controllers/TermoController';

const router = Router();

// Criar novo termo
router.post('/termos', TermoController.criar);

// Buscar termo por ID
router.get('/termos/:id', TermoController.buscarPorId);

// Buscar termo por URL de acesso
router.get('/termos/acesso/:urlAcesso', TermoController.buscarPorUrlAcesso);

// Listar todos os termos
router.get('/termos', TermoController.listar);

// Atualizar status do termo
router.patch('/termos/:id/status', TermoController.atualizarStatus);

export default router; 