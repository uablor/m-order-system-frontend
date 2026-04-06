const k=/\d/g;function d(e){if(!e||typeof e!="string")return"";const n=e.match(k);return n?n.join(""):""}function m(e){return!e||e.length<8?!1:/^\d+$/.test(e)}function f(e,n){const s=`https://wa.me/${e}`;return n&&n.trim()?`${s}?text=${encodeURIComponent(n.trim())}`:s}function g(e){const n="http://127.0.0.1:5173".trim().replace(/\/$/,""),s="/customer/item-arrived";if(!e||!e.includes("?"))return`${n}${s}`;const c=e.indexOf("?"),l=e.substring(c),a=`${n}${s}${l}`;return!a.startsWith("http://")&&!a.startsWith("https://")?`https://${a}`:a}function L(e={}){const{defaultMessage:n="",openInNewTab:s=!0}=e,c={en:{base:`Hello {customerName},

Good news! Your order has arrived and is ready for you.`,withLink:`

You can review your order details and complete the payment here:
{link}

Thank you for choosing our service!`,noLink:`

Please let us know if you have any questions. Thank you!`},th:{base:`สวัสดีค่ะ คุณลูกค้าของเรา {customerName}

ออเดอร์ของคุณ ถึงแล้ว พร้อมรับได้เลยค่ะ`,withLink:`

คุณสามารถดูรายละเอียดออเดอร์และชำระเงินได้ที่:
{link}

ขอบคุณที่ใช้บริการของเราค่ะ!`,noLink:`

หากมีคำถามสามารถติดต่อเราได้เลยนะค่ะ ขอบคุณค่ะ!`},la:{base:`ສະບາຍດີ ລູກຄ້າຂອງພວກເຮົາ {customerName}

ອໍເດີຂອງທ່ານ ມາຮອດແລ້ວ ພ້ອມຮັບໄດ້ແລ້ວເດີເຈົ້າ`,withLink:`

ທ່ານສາມາດເບິ່ງລາຍລະອຽດອໍເດີແລະຊຳລະເງິນໄດ້ທີ່:
{link}

ຂອບໃຈທີ່ໃຊ້ບໍລິການ!`,noLink:`

ຖ້າມີຄຳຖາມສາມາດຕິດຕໍ່ພວກເຮົາໄດ້ ຂອບໃຈ!`}},l=r=>{const i=r.notificationLink?g(r.notificationLink):"",t=r.lang??"en",u=c[t];if(r.message)return i?`${r.message}

${i}`:r.message;const{template:o}=r;if(!o)return n;const p=o.customerName??(t==="en"?"Customer":t==="th"?"ลูกค้า":"ລູກຄ້າ"),N=o.orderNumbers?.length?t==="en"?`Orders #${o.orderNumbers.join(", #")}`:t==="th"?`ออเดอร์ #${o.orderNumbers.join(", #")}`:`ອໍເດີ #${o.orderNumbers.join(", #")}`:o.orderNumber!=null?t==="en"?`Order #${o.orderNumber}`:t==="th"?`ออเดอร์ #${o.orderNumber}`:`ອໍເດີ #${o.orderNumber}`:t==="en"?"your order":t==="th"?"ออเดอร์ของคุณ":"ອໍເດີຂອງທ່ານ",h=u.base.replace("{customerName}",p).replace("{orderPart}",N);if(i){const b=`${i}`,$=u.withLink.replace("{link}",b);return h+$}else return h+u.noLink};return{formatPhoneForWhatsApp:d,isValidWhatsAppPhone:m,getWhatsAppUrl:f,openWhatsAppChat:r=>{const i=d(r.phone);if(!m(i))return!1;const t=l(r),u=f(i,t);return s?window.open(u,"_blank","noopener,noreferrer"):window.location.href=u,!0}}}export{L as u};
