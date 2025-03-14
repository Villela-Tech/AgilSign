"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TermoController = void 0;
const Termo_1 = __importDefault(require("../models/Termo"));
const pdfService_1 = require("../services/pdfService");
exports.TermoController = {
    // Criar novo termo
    criar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                const termo = yield Termo_1.default.create(Object.assign(Object.assign({}, req.body), { userId, urlAcesso: `http://localhost:3000/assinar/${req.body.id}` }));
                return res.status(201).json({
                    id: termo.id,
                    urlAcesso: termo.urlAcesso
                });
            }
            catch (error) {
                console.error('Erro ao criar termo:', error);
                return res.status(500).json({ error: 'Erro ao criar termo' });
            }
        });
    },
    // Buscar termo por ID
    buscarPorId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const termo = yield Termo_1.default.findOne({
                    where: {
                        id: req.params.id,
                        userId: req.userId
                    }
                });
                if (!termo) {
                    return res.status(404).json({ error: 'Termo não encontrado' });
                }
                const urlAcesso = `http://localhost:3000/assinar/${termo.id}`;
                yield termo.update({ urlAcesso });
                return res.json(Object.assign(Object.assign({}, termo.toJSON()), { urlAcesso }));
            }
            catch (error) {
                console.error('Erro ao buscar termo:', error);
                return res.status(500).json({ error: 'Erro ao buscar termo' });
            }
        });
    },
    // Buscar termo por URL de acesso
    buscarPorUrlAcesso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const termo = yield Termo_1.default.findOne({
                    where: { urlAcesso: req.params.urlAcesso }
                });
                if (!termo) {
                    return res.status(404).json({ error: 'Termo não encontrado' });
                }
                return res.json(termo);
            }
            catch (error) {
                console.error('Erro ao buscar termo:', error);
                return res.status(500).json({ error: 'Erro ao buscar termo' });
            }
        });
    },
    // Listar todos os termos
    listar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const termos = yield Termo_1.default.findAll({
                    where: { userId: req.userId }
                });
                const termosAtualizados = termos.map(termo => (Object.assign(Object.assign({}, termo.toJSON()), { urlAcesso: `http://localhost:3000/assinar/${termo.id}` })));
                return res.json(termosAtualizados);
            }
            catch (error) {
                console.error('Erro ao listar termos:', error);
                return res.status(500).json({ error: 'Erro ao listar termos' });
            }
        });
    },
    // Atualizar status do termo
    atualizarStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { status, assinatura } = req.body;
                const termo = yield Termo_1.default.findOne({
                    where: {
                        id,
                        userId: req.userId
                    }
                });
                if (!termo) {
                    return res.status(404).json({ error: 'Termo não encontrado' });
                }
                yield termo.update({ status, assinatura });
                return res.json(Object.assign(Object.assign({}, termo.toJSON()), { urlAcesso: `http://localhost:3000/assinar/${termo.id}` }));
            }
            catch (error) {
                console.error('Erro ao atualizar status:', error);
                return res.status(500).json({ error: 'Erro ao atualizar status' });
            }
        });
    },
    // Excluir termo
    excluir(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const termo = yield Termo_1.default.findOne({
                    where: {
                        id,
                        userId: req.userId
                    }
                });
                if (!termo) {
                    return res.status(404).json({ error: 'Termo não encontrado' });
                }
                yield termo.destroy();
                return res.status(204).send();
            }
            catch (error) {
                console.error('Erro ao excluir termo:', error);
                return res.status(500).json({ error: 'Erro ao excluir termo' });
            }
        });
    },
    // Gerar e baixar PDF do termo
    downloadPDF(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const termo = yield Termo_1.default.findOne({
                    where: {
                        id,
                        userId: req.userId
                    }
                });
                if (!termo) {
                    return res.status(404).json({ error: 'Termo não encontrado' });
                }
                const pdfDoc = yield (0, pdfService_1.generateTermoRecebimento)({
                    nome: termo.nome,
                    sobrenome: termo.sobrenome,
                    email: termo.email,
                    equipamento: termo.equipamento,
                    assinatura: termo.assinatura,
                    data: termo.createdAt.toLocaleDateString('pt-BR')
                });
                const pdfBytes = pdfDoc.output('arraybuffer');
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=termo-${termo.nome.toLowerCase()}-${termo.id}.pdf`);
                res.send(Buffer.from(pdfBytes));
            }
            catch (error) {
                console.error('Erro ao gerar PDF:', error);
                return res.status(500).json({ error: 'Erro ao gerar PDF do termo' });
            }
        });
    }
};
