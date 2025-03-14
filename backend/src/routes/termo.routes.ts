import { Router } from 'express';
import { TermoController } from '../controllers/TermoController';

const router = Router();

// Criar novo termo
router.post('/', TermoController.criar);

// Buscar termo por ID
router.get('/:id', TermoController.buscarPorId);

// Buscar termo por URL de acesso
router.get('/acesso/:urlAcesso', TermoController.buscarPorUrlAcesso);

// Listar todos os termos
router.get('/', TermoController.listar);

// Atualizar status do termo
router.patch('/:id/status', TermoController.atualizarStatus);

// Excluir termo
router.delete('/:id', TermoController.excluir);

// Download do PDF do termo
router.get('/:id/pdf', TermoController.downloadPDF);

export default router; 