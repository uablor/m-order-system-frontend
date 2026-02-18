const DEFAULT_PATH = '/';

export function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
  const value = match?.[1];
  return value ? decodeURIComponent(value) : '';
}

export function setCookie(
  name: string,
  value: string,
  options: {
    maxAgeSeconds?: number;
    path?: string;
    secure?: boolean;
    sameSite?: 'Lax' | 'Strict' | 'None';
  } = {}
): void {
  if (typeof document === 'undefined') return;

  const path = options.path ?? DEFAULT_PATH;
  let cookie = `${name}=${encodeURIComponent(value)}; Path=${path}; SameSite=${options.sameSite ?? 'Lax'}`;

  if (typeof options.maxAgeSeconds === 'number') {
    cookie += `; Max-Age=${Math.max(0, Math.floor(options.maxAgeSeconds))}`;
  }

  if (options.secure) {
    cookie += '; Secure';
  }

  document.cookie = cookie;
}

export function deleteCookie(name: string, path = DEFAULT_PATH): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=${path}; Max-Age=0; SameSite=Lax`;
}

