import * as crypto from 'crypto';

export function base64url(str: string | Buffer, encoding: BufferEncoding = 'utf8'): string {
  const buf = typeof str === 'string' ? Buffer.from(str, encoding) : str;
  return buf.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function signJwt(payload: any, secret: string, expiresInSeconds: number = 86400): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };
  
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(fullPayload));

  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  
  // Create signature using sha256 HMAC
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(signatureInput);
  
  // Node.js support for digest('base64') -> base64url replacement
  const signature = hmac.digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyJwt(token: string, secret: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [header, payload, signature] = parts;
    const signatureInput = `${header}.${payload}`;
    
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(signatureInput);
    const expectedSignature = hmac.digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (signature !== expectedSignature) {
      return null;
    }

    const decodedPayload = JSON.parse(
      Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    );
    
    const now = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp && now > decodedPayload.exp) {
      return null; // Expired
    }

    return decodedPayload;
  } catch (error) {
    return null;
  }
}

export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return verifyHash === hash;
}
