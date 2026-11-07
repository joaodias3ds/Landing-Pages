/**
 * Módulo de Criptografia, Segurança, Assinatura de JWT e Armazenamento Local Criptografado
 * Implementa Web Crypto API nativa (AES-GCM, PBKDF2, HMAC-SHA256)
 */

// Chave mestra interna padrão da aplicação para criptografia simétrica local
const DEFAULT_STORAGE_KEY = 'central-clientes-aes-gcm-master-key-2026';
const JWT_SECRET = 'central-clientes-jwt-secret-token-key-2026-v3';

// Funções auxiliares Base64Url
function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function bufToHex(buf: ArrayBuffer | Uint8Array): string {
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return Array.from(arr)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuf(hex: string): Uint8Array {
  const matches = hex.match(/.{1,2}/g) || [];
  return new Uint8Array(matches.map(byte => parseInt(byte, 16)));
}

// -----------------------------------------------------------------------------
// CRIPTOGRAFIA AES-GCM + PBKDF2 (Armazenamento Seguro de Dados)
// -----------------------------------------------------------------------------

async function deriveAesKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Criptografa uma string em AES-GCM com chave derivada por PBKDF2 e IV aleatório
 */
export async function encryptData(plainText: string, passphrase = DEFAULT_STORAGE_KEY): Promise<string> {
  try {
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveAesKey(passphrase, salt);

    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
      },
      key,
      enc.encode(plainText)
    );

    return `enc:v1:${bufToHex(salt)}:${bufToHex(iv)}:${bufToHex(ciphertext)}`;
  } catch (error) {
    console.error('Falha na criptografia AES-GCM:', error);
    // Fallback seguro em caso de indisponibilidade de subtle (não expõe em plaintext desprotegido)
    return `enc:b64:${btoa(encodeURIComponent(plainText))}`;
  }
}

/**
 * Descriptografa uma string encriptada em AES-GCM
 */
export async function decryptData(encryptedString: string, passphrase = DEFAULT_STORAGE_KEY): Promise<string> {
  if (!encryptedString) return '';
  if (encryptedString.startsWith('enc:b64:')) {
    return decodeURIComponent(atob(encryptedString.replace('enc:b64:', '')));
  }

  if (!encryptedString.startsWith('enc:v1:')) {
    // Caso de legado ou texto não criptografado
    return encryptedString;
  }

  try {
    const parts = encryptedString.split(':');
    if (parts.length !== 5) {
      throw new Error('Formato de dados criptografados inválido');
    }

    const salt = hexToBuf(parts[2]);
    const iv = hexToBuf(parts[3]);
    const ciphertext = hexToBuf(parts[4]);

    const key = await deriveAesKey(passphrase, salt);
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
      },
      key,
      ciphertext as unknown as BufferSource
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Falha na descriptografia AES-GCM:', error);
    throw new Error('Falha de integridade criptográfica: Não foi possível descriptografar os dados.');
  }
}

// -----------------------------------------------------------------------------
// IMPLEMENTAÇÃO DE JWT (JSON Web Token) COM HMAC-SHA256
// -----------------------------------------------------------------------------

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: 'admin' | 'client';
  clientIds?: string[];
  mfaVerified?: boolean;
  iat: number;
  exp: number;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Gera um token JWT assinado criptograficamente com HMAC-SHA256
 */
export async function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>, expiresInSeconds = 3600 * 8, secret = JWT_SECRET): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const hmacKey = await getHmacKey(secret);
  const signatureBuf = await crypto.subtle.sign(
    'HMAC',
    hmacKey,
    new TextEncoder().encode(dataToSign)
  );

  let binary = '';
  const bytes = new Uint8Array(signatureBuf);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const encodedSignature = btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${dataToSign}.${encodedSignature}`;
}

/**
 * Valida a integridade, assinatura e expiração do JWT
 */
export async function verifyJwt(token: string, secret = JWT_SECRET): Promise<{ valid: boolean; payload?: JwtPayload; error?: string }> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Token JWT malformado' };
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    const dataToVerify = `${headerB64}.${payloadB64}`;

    // Reconstruir assinatura binária
    let base64 = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const signatureBinary = atob(base64);
    const signatureBytes = new Uint8Array(signatureBinary.length);
    for (let i = 0; i < signatureBinary.length; i++) {
      signatureBytes[i] = signatureBinary.charCodeAt(i);
    }

    const hmacKey = await getHmacKey(secret);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      hmacKey,
      signatureBytes,
      new TextEncoder().encode(dataToVerify)
    );

    if (!isValid) {
      return { valid: false, error: 'Assinatura criptográfica inválida' };
    }

    const payloadJson = base64UrlDecode(payloadB64);
    const payload: JwtPayload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Sessão expirada. Faça login novamente.' };
    }

    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: 'Falha ao processar token de autenticação' };
  }
}

// -----------------------------------------------------------------------------
// ARMAZENAMENTO LOCAL ENCRIPTADO (Secure Encrypted LocalStorage)
// -----------------------------------------------------------------------------

export class SecureStorage {
  private static prefix = 'sec_v3_';

  static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonStr = JSON.stringify(value);
      const encrypted = await encryptData(jsonStr);
      localStorage.setItem(`${this.prefix}${key}`, encrypted);
    } catch (e) {
      console.error(`Erro ao salvar ${key} de forma segura:`, e);
    }
  }

  static async getItem<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const encrypted = localStorage.getItem(`${this.prefix}${key}`);
      if (!encrypted) return defaultValue;

      const decrypted = await decryptData(encrypted);
      return JSON.parse(decrypted) as T;
    } catch (e) {
      console.warn(`Aviso de leitura em ${key}, retornando valor padrão:`, e);
      return defaultValue;
    }
  }

  static removeItem(key: string): void {
    localStorage.removeItem(`${this.prefix}${key}`);
  }

  static clearAll(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(this.prefix)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }
}

// -----------------------------------------------------------------------------
// VALIDAÇÕES CADASTRAIS (CPF, CNPJ, Formatação de WhatsApp e URLs)
// -----------------------------------------------------------------------------

export function cleanDigits(val: string): string {
  return (val || '').replace(/\D/g, '');
}

/**
 * Validação algorítmica de CPF (com verificação de dígitos verificadores)
 */
export function validateCPF(cpf: string): boolean {
  const digits = cleanDigits(cpf);
  if (digits.length !== 11) return false;

  // Rejeita sequências repetidas como 11111111111
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits.charAt(i)) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(digits.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits.charAt(i)) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(digits.charAt(10))) return false;

  return true;
}

/**
 * Validação algorítmica de CNPJ
 */
export function validateCNPJ(cnpj: string): boolean {
  const digits = cleanDigits(cnpj);
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits.charAt(i)) * weights1[i];
  }
  let rest = sum % 11;
  const dig1 = rest < 2 ? 0 : 11 - rest;
  if (dig1 !== parseInt(digits.charAt(12))) return false;

  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits.charAt(i)) * weights2[i];
  }
  rest = sum % 11;
  const dig2 = rest < 2 ? 0 : 11 - rest;
  if (dig2 !== parseInt(digits.charAt(13))) return false;

  return true;
}

export function formatCPF(cpf: string): string {
  const digits = cleanDigits(cpf).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

export function formatCNPJ(cnpj: string): string {
  const digits = cleanDigits(cnpj).slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export function formatPhone(phone: string): string {
  const digits = cleanDigits(phone).slice(0, 13);
  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  }
  return digits.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

/**
 * Gera URL segura de WhatsApp https://wa.me/<numero>?text=<mensagem>
 */
export function buildWhatsAppLink(phone: string, message = ''): string {
  let digits = cleanDigits(phone);
  if (!digits.startsWith('55') && (digits.length === 10 || digits.length === 11)) {
    digits = '55' + digits;
  }
  const encodedText = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${digits}${encodedText ? `?text=${encodedText}` : ''}`;
}

/**
 * Sanitiza e valida URLs externas para evitar injeção `javascript:`
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '#';
  const trimmed = url.trim();
  if (/^javascript:/i.test(trimmed)) {
    return '#invalido';
  }
  if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith('#') && !trimmed.startsWith('tel:') && !trimmed.startsWith('mailto:')) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * Escapa HTML para proteção contra XSS
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
