import jwt from 'jsonwebtoken';
import { config } from '../config';

/** JWT token payload structure */
interface TokenPayload {
  userId: string;
  role: string;
}

/** Generate a signed JWT token */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
}

/** Verify and decode a JWT token */
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
}
