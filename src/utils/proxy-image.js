import { CONFIG } from 'src/global-config';

/**
 * Proxy Instagram images through backend to bypass CORS
 */
export function proxyImage(url) {
  if (!url) return null;
  
  // If it's an Instagram CDN URL, proxy it
  if (url.includes('fbcdn.net') || url.includes('cdninstagram.com')) {
    return `${CONFIG.serverUrl}/proxy-image?url=${encodeURIComponent(url)}`;
  }
  
  return url;
}
