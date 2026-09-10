import { URL } from 'url';

/**
 * Validates a target URL against SSRF (Server-Side Request Forgery) attacks.
 * Blocks localhost, private subnets (RFC 1918), link-local, cloud metadata, and invalid schemes.
 */
export function validateSafeUrl(rawUrl: string): { isValid: boolean; error?: string; safeUrl?: string } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, error: 'URL is required' };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { isValid: false, error: 'Malformed URL format' };
  }

  // Scheme validation: only allow HTTP and HTTPS
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { isValid: false, error: `Invalid protocol: ${parsed.protocol}. Only http and https allowed.` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost aliases and names
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname === '[::1]' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan') ||
    hostname.endsWith('.localdomain')
  ) {
    return { isValid: false, error: 'Access to localhost or internal network domains is strictly forbidden' };
  }

  // Cloud metadata services
  if (
    hostname === '169.254.169.254' ||
    hostname === 'metadata.google.internal' ||
    hostname === 'instance-data'
  ) {
    return { isValid: false, error: 'Access to cloud instance metadata services is forbidden' };
  }

  // IPv4 Private Range Check
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const ipMatch = hostname.match(ipv4Regex);
  if (ipMatch) {
    const [, o1, o2] = ipMatch.map(Number);

    // 10.0.0.0/8
    if (o1 === 10) {
      return { isValid: false, error: 'Access to private RFC 1918 10.x.x.x addresses is forbidden' };
    }
    // 172.16.0.0/12 (172.16.0.0 – 172.31.255.255)
    if (o1 === 172 && o2 >= 16 && o2 <= 31) {
      return { isValid: false, error: 'Access to private RFC 1918 172.16-31.x.x addresses is forbidden' };
    }
    // 192.168.0.0/16
    if (o1 === 192 && o2 === 168) {
      return { isValid: false, error: 'Access to private RFC 1918 192.168.x.x addresses is forbidden' };
    }
    // 169.254.0.0/16 (Link local / APIPA)
    if (o1 === 169 && o2 === 254) {
      return { isValid: false, error: 'Access to link-local 169.254.x.x addresses is forbidden' };
    }
    // 127.0.0.0/8 (Loopback)
    if (o1 === 127) {
      return { isValid: false, error: 'Access to loopback 127.x.x.x addresses is forbidden' };
    }
    // 0.0.0.0/8
    if (o1 === 0) {
      return { isValid: false, error: 'Access to broadcast/unspecified 0.x.x.x addresses is forbidden' };
    }
  }

  return { isValid: true, safeUrl: parsed.toString() };
}
