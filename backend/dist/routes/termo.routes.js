"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TermoController_1 = require("../controllers/TermoController");
const router = (0, express_1.Router)();
// Criar novo termo
router.post('/', TermoController_1.TermoController.criar);
// Buscar termo por ID
router.get('/:id', TermoController_1.TermoController.buscarPorId);
// Buscar termo por URL de acesso
router.get('/acesso/:urlAcesso', TermoController_1.TermoController.buscarPorUrlAcesso);
// Listar todos os termos
router.get('/', TermoController_1.TermoController.listar);
// Atualizar status do termo
router.patch('/:id/status', TermoController_1.TermoController.atualizarStatus);
// Excluir termo
router.delete('/:id', TermoController_1.TermoController.excluir);
// Download do PDF do termo
router.get('/:id/pdf', TermoController_1.TermoController.downloadPDF);
exports.default = router;
