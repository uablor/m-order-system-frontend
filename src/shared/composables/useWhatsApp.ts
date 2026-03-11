/**
 * Composable สำหรับ WhatsApp click-to-chat
 * รองรับการ format เบอร์โทร, สร้าง URL และเปิดแชทในแท็บใหม่
 */

/** Regex สำหรับดึงเฉพาะตัวเลขเท่านั้น */
const NUMBERS_ONLY_REGEX = /\d/g;

/** ความยาวขั้นต่ำของเบอร์โทรที่ถูกต้อง (อย่างน้อย 8 หลัก) */
const MIN_PHONE_LENGTH = 8;

/**
 * แปลงเบอร์โทรเป็นรูปแบบ international สำหรับ WhatsApp
 * ลบ + และอักขระที่ไม่ใช่ตัวเลข
 * @example "+856 20 7896 1715" → "8562078961715"
 */
export function formatPhoneForWhatsApp(phone: string | null | undefined): string {
  if (!phone || typeof phone !== 'string') return '';
  const digits = phone.match(NUMBERS_ONLY_REGEX);
  return digits ? digits.join('') : '';
}

/**
 * ตรวจสอบว่าเบอร์โทรถูกต้องหลังจาก format แล้ว
 * ต้องมีเฉพาะตัวเลขและไม่สั้นเกินไป
 */
export function isValidWhatsAppPhone(formatted: string): boolean {
  if (!formatted || formatted.length < MIN_PHONE_LENGTH) return false;
  return /^\d+$/.test(formatted);
}

/**
 * สร้าง URL สำหรับเปิด WhatsApp chat
 * @param phone เบอร์โทรที่ format แล้ว (เฉพาะตัวเลข)
 * @param message ข้อความที่ต้องการส่ง (จะถูก encode ด้วย encodeURIComponent)
 */
export function getWhatsAppUrl(
  phone: string,
  message?: string
): string {
  const base = `https://wa.me/${phone}`;
  if (message && message.trim()) {
    return `${base}?text=${encodeURIComponent(message.trim())}`;
  }
  return base;
}

export interface UseWhatsAppOptions {
  /** ข้อความเริ่มต้น (จะถูก encode อัตโนมัติ) */
  defaultMessage?: string;
  /** เปิดในแท็บใหม่หรือไม่ */
  openInNewTab?: boolean;
}

export type WhatsAppMessageLang = 'en' | 'th' | 'la';

export interface OpenWhatsAppParams {
  /** เบอร์โทร (รองรับรูปแบบ +856 20 7896 1715) */
  phone: string,
  /** ข้อความ (optional) */
  message?: string,
  /** ข้อมูลสำหรับสร้างข้อความแบบ template */
  template?: {
    customerName?: string;
    orderNumber?: string | number;
    orderNumbers?: (string | number)[];
  };
  /** notificationLink จาก record (อาจมี undefined เป็น base — จะถูกแทนที่ด้วย VITE_APP_URL) */
  notificationLink?: string | null;
  /** ภาษาของข้อความ template: en, th, la */
  lang?: WhatsAppMessageLang;
}

/** สร้าง customer link ที่ถูกต้องจาก notificationLink (แก้ undefined base) */
function buildCustomerNotificationLink(notificationLink: string | null | undefined): string {
  // ใช้ VITE_APP_URL (frontend) สำหรับ customer link — VITE_API_BASE_URL เป็น API server
  const base = (
    import.meta.env.VITE_APP_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '')
  )
    .toString()
    .trim()
    .replace(/\/$/, '');
  const path = '/customer/item-arrived';
  if (!notificationLink || !notificationLink.includes('?')) {
    return `${base}${path}`;
  }
  const queryIdx = notificationLink.indexOf('?');
  const query = notificationLink.substring(queryIdx);
  const fullUrl = `${base}${path}${query}`;
  
  // Ensure URL has proper https:// protocol for WhatsApp recognition
  if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
    return `https://${fullUrl}`;
  }
  
  return fullUrl;
}

/**
 * Composable สำหรับ WhatsApp click-to-chat
 */
export function useWhatsApp(options: UseWhatsAppOptions = {}) {
  const { defaultMessage = '', openInNewTab = true } = options;

  /** ข้อความ template แยกตามภาษา */
  const MESSAGE_TEMPLATES: Record<WhatsAppMessageLang, { base: string; withLink: string; noLink: string }> = {
    en: {
      base: 'Hello {customerName},\n\nGood news! Your order has arrived and is ready for you.',
      withLink: '\n\nYou can review your order details and complete the payment here:\n{link}\n\nThank you for choosing our service!',
      noLink: '\n\nPlease let us know if you have any questions. Thank you!',
    },
    th: {
      base: 'สวัสดีค่ะ คุณลูกค้าของเรา {customerName}\n\nออเดอร์ของคุณ ถึงแล้ว พร้อมรับได้เลยค่ะ',
      withLink: '\n\nคุณสามารถดูรายละเอียดออเดอร์และชำระเงินได้ที่:\n{link}\n\nขอบคุณที่ใช้บริการของเราค่ะ!',
      noLink: '\n\nหากมีคำถามสามารถติดต่อเราได้เลยนะค่ะ ขอบคุณค่ะ!',
    },
    la: {
      base: 'ສະບາຍດີ ລູກຄ້າຂອງພວກເຮົາ {customerName}\n\nອໍເດີຂອງທ່ານ ມາຮອດແລ້ວ ພ້ອມຮັບໄດ້ແລ້ວເດີເຈົ້າ',
      withLink: '\n\nທ່ານສາມາດເບິ່ງລາຍລະອຽດອໍເດີແລະຊຳລະເງິນໄດ້ທີ່:\n{link}\n\nຂອບໃຈທີ່ໃຊ້ບໍລິການ!',
      noLink: '\n\nຖ້າມີຄຳຖາມສາມາດຕິດຕໍ່ພວກເຮົາໄດ້ ຂອບໃຈ!',
    },
  };

  /**
   * สร้างข้อความจาก template ตามภาษาที่เลือก
   */
  const buildMessage = (params: OpenWhatsAppParams): string => {
    const customerLink = params.notificationLink
      ? buildCustomerNotificationLink(params.notificationLink)
      : '';
    const lang = params.lang ?? 'en';
    const tpl = MESSAGE_TEMPLATES[lang];

    if (params.message) {
      return customerLink ? `${params.message}\n\n${customerLink}` : params.message;
    }

    const { template } = params;
    if (!template) return defaultMessage;

    const customerName = template.customerName ?? (lang === 'en' ? 'Customer' : lang === 'th' ? 'ลูกค้า' : 'ລູກຄ້າ');
    const orderPart = template.orderNumbers?.length
      ? (lang === 'en' ? `Orders #${template.orderNumbers.join(', #')}` : lang === 'th' ? `ออเดอร์ #${template.orderNumbers.join(', #')}` : `ອໍເດີ #${template.orderNumbers.join(', #')}`)
      : template.orderNumber != null
        ? (lang === 'en' ? `Order #${template.orderNumber}` : lang === 'th' ? `ออเดอร์ #${template.orderNumber}` : `ອໍເດີ #${template.orderNumber}`)
        : (lang === 'en' ? 'your order' : lang === 'th' ? 'ออเดอร์ของคุณ' : 'ອໍເດີຂອງທ່ານ');

    const baseMsg = tpl.base.replace('{customerName}', customerName).replace('{orderPart}', orderPart);
    
    if (customerLink) {
      // Format the link to be more recognizable as a clickable URL
      const formattedLink = `${customerLink}`;
      const linkMessage = tpl.withLink.replace('{link}', formattedLink);
      return baseMsg + linkMessage;
    } else {
      return baseMsg + tpl.noLink;
    }
  };

  /**
   * เปิด WhatsApp chat
   * @returns true ถ้าเปิดได้, false ถ้าเบอร์โทรไม่ถูกต้อง
   */
  const openWhatsAppChat = (params: OpenWhatsAppParams): boolean => {
    const formatted = formatPhoneForWhatsApp(params.phone);
    if (!isValidWhatsAppPhone(formatted)) return false;

    const message = buildMessage(params);
    const url = getWhatsAppUrl(formatted, message);

    if (openInNewTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
    return true;
  };

  return {
    formatPhoneForWhatsApp,
    isValidWhatsAppPhone,
    getWhatsAppUrl,
    openWhatsAppChat,
  };
}
