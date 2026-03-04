/**
 * Composable สำหรับ Facebook Messenger click-to-chat
 * เปิดแชทกับผู้ใช้ที่ add friend แล้ว
 * URL: https://www.facebook.com/messages/t/{facebookId}
 */

const FACEBOOK_MESSENGER_BASE = 'https://www.facebook.com/messages/t';

/**
 * สร้าง URL สำหรับเปิด Facebook Messenger chat
 * @param facebookId Facebook username (john.doe.123) หรือ numeric ID (1000123456789)
 */
export function getFacebookMessengerUrl(facebookId: string): string {
  const id = (facebookId || '').trim();
  if (!id) return '';
  return `${FACEBOOK_MESSENGER_BASE}/${encodeURIComponent(id)}`;
}

/**
 * ตรวจสอบว่า Facebook ID ใช้ได้ (ไม่ว่างและมีความยาวพอสมควร)
 */
export function isValidFacebookId(facebookId: string | null | undefined): boolean {
  if (!facebookId || typeof facebookId !== 'string') return false;
  const trimmed = facebookId.trim();
  return trimmed.length >= 3;
}

export interface UseFacebookMessengerOptions {
  /** เปิดในแท็บใหม่หรือไม่ */
  openInNewTab?: boolean;
}

/**
 * Composable สำหรับ Facebook Messenger click-to-chat
 */
export function useFacebookMessenger(options: UseFacebookMessengerOptions = {}) {
  const { openInNewTab = true } = options;

  /**
   * เปิด Facebook Messenger chat
   * @returns true ถ้าเปิดได้, false ถ้า Facebook ID ไม่ถูกต้อง
   */
  const openFacebookMessengerChat = (facebookId: string | null | undefined): boolean => {
    if (!isValidFacebookId(facebookId)) return false;
    const url = getFacebookMessengerUrl(facebookId!);
    if (!url) return false;

    if (openInNewTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
    return true;
  };

  return {
    getFacebookMessengerUrl,
    isValidFacebookId,
    openFacebookMessengerChat,
  };
}
