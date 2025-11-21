import jwt from 'jsonwebtoken';
import { config } from '../config/env';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  const secret = config.jwt.secret as string;
  const expiresIn = config.jwt.expiresIn;

  // Workaround for @types/jsonwebtoken type issues
  return jwt.sign(payload, secret, { expiresIn } as any);
};

export const verifyToken = (token: string): TokenPayload => {
  const secret = config.jwt.secret as string;
  return jwt.verify(token, secret) as TokenPayload;
};
