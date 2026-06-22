import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { prisma } from './prisma';
import { COMPANY } from './company';
import { courierName, deliveryTypeLabel } from './couriers';
import { ADMIN_NOTIFY_EMAILS } from './admin-emails';
import { eur, lev } from './currency';
import { orderNumber } from './orders';

// ── SMTP configuration (from .env) ────────────────────────────────────
// Sends through your existing mailbox (info@soapfactory.bg). Until the SMTP
// settings are filled in, sending is skipped gracefully (nothing breaks).
const HOST = process.env.SMTP_HOST;
const PORT = Number(process.env.SMTP_PORT || 587);
const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASS;
const FROM = process.env.SMTP_FROM || (USER ? `"${COMPANY.brand}" <${USER}>` : '');

export function isEmailConfigured(): boolean {
  return !!(HOST && USER && PASS);
}

let transporter: nodemailer.Transporter | null = null;
function getTransporter() {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      secure: PORT === 465, // 465 = implicit TLS; 587 = STARTTLS
      auth: { user: USER, pass: PASS },
    });
  }
  return transporter;
}

async function sendMail(opts: { to: string; subject: string; html: string }): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    console.warn('[email] SMTP not configured — skipped sending:', opts.subject, '->', opts.to);
    return false;
  }
  try {
    await t.sendMail({ from: FROM, ...opts });
    return true;
  } catch (err) {
    console.error('[email] send failed:', (err as Error).message);
    return false;
  }
}

// ── Templates ─────────────────────────────────────────────────────────
const TEMPLATE_DIR = path.join(process.cwd(), 'email-templates');

function loadTemplate(file: string): string {
  const raw = fs.readFileSync(path.join(TEMPLATE_DIR, file), 'utf8');
  // Strip the leading <!-- ... --> placeholder-docs comment.
  return raw.replace(/^<!--[\s\S]*?-->\s*/, '');
}

function render(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

// ── Formatting helpers ───────────────────────────────────────────────
const money = (amount: number) => `${eur(amount)} € (${lev(amount)} лв.)`;
const formatDate = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
};
const paymentMethodLabel = (m: string) => (m === 'stripe' ? 'Credit / Debit Card' : 'Плащане при доставка');

type OrderWithItems = {
  id: string; customerName: string; email: string; phone: string;
  city: string; address: string; postcode: string | null;
  subtotal: number; shipping: number; total: number;
  paymentMethod: string; courier: string | null; deliveryType: string | null;
  createdAt: Date;
  items: { name: string; price: number; quantity: number; product: { sku: string | null } | null }[];
};

function shippingLabel(order: OrderWithItems): string {
  const typeLabel = deliveryTypeLabel(order.deliveryType); // "до офис" | "до автомат" | "до адрес" | "—"
  const cap = typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1);
  return `${cap} ${courierName(order.courier)}`;
}

function shippingPriceLabel(order: OrderWithItems): string {
  return order.shipping === 0 ? 'Безплатна' : money(order.shipping);
}

function deliveryAddressLine(order: OrderWithItems): string {
  if (order.deliveryType === 'address' && order.postcode) return `${order.address} (${order.postcode})`;
  return order.address;
}

function itemsRows(order: OrderWithItems, withSku: boolean, stripeColor: string, borderColor: string = '#eee'): string {
  return order.items.map((i, idx) => {
    const skuPart = withSku && i.product?.sku ? ` <span style="color:#aaa;font-size:12px;">(#${i.product.sku})</span>` : '';
    const bg = idx % 2 === 1 ? ` background-color:${stripeColor};` : '';
    return `
    <tr>
      <td style="padding:12px 8px;border-bottom:1px solid ${borderColor};color:#333;font-size:14px;line-height:1.5;${bg}">${i.name}${skuPart}</td>
      <td style="padding:12px 8px;border-bottom:1px solid ${borderColor};color:#777;font-size:14px;text-align:center;white-space:nowrap;${bg}">${i.quantity}</td>
      <td style="padding:12px 8px;border-bottom:1px solid ${borderColor};color:#333;font-size:14px;text-align:right;white-space:nowrap;${bg}">${money(i.price * i.quantity)}</td>
    </tr>`;
  }).join('');
}

function sharedVars(order: OrderWithItems) {
  return {
    customerName: order.customerName,
    orderNumber: orderNumber(order.id),
    orderDate: formatDate(order.createdAt),
    subtotal: money(order.subtotal),
    shippingLabel: shippingLabel(order),
    shippingPrice: shippingPriceLabel(order),
    paymentMethod: paymentMethodLabel(order.paymentMethod),
    total: money(order.total),
    deliveryName: order.customerName,
    deliveryAddressLine: deliveryAddressLine(order),
    deliveryCity: order.city,
    customerPhone: order.phone,
    customerEmail: order.email,
  };
}

function customerEmailHtml(order: OrderWithItems, trackOrderUrl: string): string {
  return render(loadTemplate('order-confirmation.html'), {
    ...sharedVars(order),
    itemsRows: itemsRows(order, false, '#FFF8FB', '#f5e9f0'),
    deliveryCountry: 'България',
    trackOrderUrl,
  });
}

function densityClass(itemCount: number): string {
  if (itemCount > 22) return 'email-tight';
  if (itemCount > 10) return 'email-compact';
  return '';
}

function shopEmailHtml(order: OrderWithItems, orderUrl: string): string {
  return render(loadTemplate('shop-notification.html'), {
    ...sharedVars(order),
    itemsRows: itemsRows(order, true, '#f7faf6'),
    orderUrl,
    densityClass: densityClass(order.items.length),
  });
}

/**
 * Send a password-reset link to the given email address.
 */
export async function sendPasswordResetEmail(email: string, name: string | undefined, token: string): Promise<void> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const resetUrl = `${siteUrl}/zabravena-parola/nova?token=${token}`;
  const greeting = name ? `Здравей, ${name}!` : 'Здравей!';

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
    <div style="background:#9B72C7;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
      <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">Сапунена работилница</span>
    </div>
    <div style="border:1px solid #e8e0da;border-top:none;border-radius:0 0 8px 8px;padding:32px 24px;">
      <p style="font-size:15px;color:#333;margin-bottom:8px;">${greeting}</p>
      <p style="font-size:14px;color:#555;line-height:1.7;margin-bottom:24px;">
        Получихме заявка за смяна на паролата на твоя акаунт. Натисни бутона по-долу, за да зададеш нова парола.
      </p>
      <div style="text-align:center;margin-bottom:24px;">
        <a href="${resetUrl}"
           style="display:inline-block;background:#9B72C7;color:#fff;text-decoration:none;padding:13px 32px;border-radius:6px;font-size:15px;font-weight:700;">
          Смени паролата
        </a>
      </div>
      <p style="font-size:12px;color:#999;line-height:1.6;margin-bottom:4px;">
        Линкът е валиден <strong>1 час</strong>. Ако не си поискал/а смяна на парола, просто игнорирай това писмо.
      </p>
      <p style="font-size:11px;color:#bbb;">Или копирай в браузъра: ${resetUrl}</p>
    </div>
    <p style="text-align:center;font-size:11px;color:#ccc;margin-top:16px;">© Сапунена работилница</p>
  </div>`;

  await sendMail({
    to: email,
    subject: 'Смяна на парола — Сапунена работилница',
    html,
  });
}

/**
 * Send order confirmation (to customer) + notification (to admins), once.
 * Safe to call multiple times — guarded by confirmationSentAt.
 */
export async function sendOrderEmails(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: { select: { sku: true } } } } },
  });
  if (!order || order.confirmationSentAt) return;

  const num = orderNumber(order.id);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const orderUrl = `${siteUrl}/admin/porachki/${order.id}`;
  const trackOrderUrl = `${siteUrl}/account/porachki`;

  const ok = await sendMail({
    to: order.email,
    subject: 'Вашата поръчка от Сапунена работилница е получена.',
    html: customerEmailHtml(order, trackOrderUrl),
  });

  const adminHtml = shopEmailHtml(order, orderUrl);
  await Promise.all(
    ADMIN_NOTIFY_EMAILS.map((to) =>
      sendMail({ to, subject: `🛒 Нова поръчка №${num}`, html: adminHtml })
    )
  );

  // Mark sent only if the customer email actually went out (so it retries later otherwise).
  if (ok) {
    await prisma.order.update({ where: { id: orderId }, data: { confirmationSentAt: new Date() } });
  }
}
