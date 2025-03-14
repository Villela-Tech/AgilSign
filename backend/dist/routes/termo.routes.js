"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TermoController_1 = require("../controllers/TermoController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Rotas protegidas (requerem autenticação)
router.use(auth_middleware_1.authMiddleware);
// Criar novo termo
router.post('/termos', TermoController_1.TermoController.criar);
// Buscar termo por ID
router.get('/termos/:id', TermoController_1.TermoController.buscarPorId);
// Buscar termo por URL de acesso
router.get('/termos/acesso/:urlAcesso', TermoController_1.TermoController.buscarPorUrlAcesso);
// Listar todos os termos
router.get('/termos', TermoController_1.TermoController.listar);
// Atualizar status do termo
router.patch('/termos/:id/status', TermoController_1.TermoController.atualizarStatus);
// Excluir termo
router.delete('/termos/:id', TermoController_1.TermoController.excluir);
// Download do PDF do termo
router.get('/termos/:id/pdf', TermoController_1.TermoController.downloadPDF);
exports.default = router;
