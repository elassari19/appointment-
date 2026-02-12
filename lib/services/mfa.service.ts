import * as jsonwebtoken from 'jsonwebtoken';
import crypto from 'crypto';

const TOKEN_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRES_IN = '15m';
const CODE_LENGTH = 6;

export class MfaService {
  generateSecret(): string {
    return crypto.randomBytes(20).toString('base64').slice(0, 32);
  }

  generateRecoveryCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(3).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  generateTotpToken(secret: string): string {
    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / 30);
    
    const key = Buffer.from(secret, 'base64');
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64BE(BigInt(counter));
    
    const hmac = crypto.createHmac('sha1', key);
    hmac.update(buffer);
    
    const offset = hmac.digest()[hmac.digest().length - 1] & 0x0f;
    const binary = ((hmac.digest()[offset] as number) & 0x7f) << 24 |
                   ((hmac.digest()[offset + 1] as number) & 0xff) << 16 |
                   ((hmac.digest()[offset + 2] as number) & 0xff) << 8 |
                   (hmac.digest()[offset + 3] as number) & 0xff;
    
    const token = binary % Math.pow(10, CODE_LENGTH);
    return token.toString().padStart(CODE_LENGTH, '0');
  }

  generateVerifyToken(): string {
    return jsonwebtoken.sign(
      { purpose: 'mfa_verify' },
      TOKEN_SECRET,
      { expiresIn: TOKEN_EXPIRES_IN }
    );
  }

  verifyVerifyToken(token: string): boolean {
    try {
      const decoded = jsonwebtoken.verify(token, TOKEN_SECRET, { complete: true });
      return (decoded.payload as any).purpose === 'mfa_verify';
    } catch {
      return false;
    }
  }

  encryptSecret(secret: string): string {
    return Buffer.from(secret).toString('base64');
  }

  decryptSecret(encrypted: string): string {
    return Buffer.from(encrypted, 'base64').toString('utf8');
  }

  hashCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  verifyCode(secret: string, code: string): boolean {
    const currentToken = this.generateTotpToken(secret);
    const hashedCode = this.hashCode(code);
    const hashedCurrent = this.hashCode(currentToken);
    
    return hashedCode === hashedCurrent;
  }
}