import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

interface TokenPayload {
  id: number;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('Verificando autenticação...');
    const authHeader = req.headers.authorization;
    console.log('Header de autorização:', authHeader);

    if (!authHeader) {
      console.log('Token não fornecido');
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const [, token] = authHeader.split(' ');
    console.log('Token extraído:', token);

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'sua_chave_secreta'
      ) as TokenPayload;

      console.log('Token decodificado:', decoded);

      const user = await User.findByPk(decoded.id);
      console.log('Usuário encontrado:', user ? 'Sim' : 'Não');

      if (!user) {
        console.log('Usuário não encontrado');
        return res.status(401).json({ message: 'Usuário não encontrado' });
      }

      req.userId = decoded.id;
      console.log('ID do usuário definido:', req.userId);
      return next();
    } catch (error) {
      console.log('Erro ao verificar token:', error);
      return res.status(401).json({ message: 'Token inválido' });
    }
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({ message: 'Erro na autenticação' });
  }
}; 