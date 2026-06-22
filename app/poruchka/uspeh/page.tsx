import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { sendOrderEmails } from '@/lib/email';
import { orderNumber } from '@/lib/orders';
import ClearCartOnMount from '@/components/ClearCartOnMount';

export const dynamic = 'force-dynamic';
const hf = 'var(--font-body)';

export default async function PaymentSuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: orderId } = await searchParams;
  const order = orderId
    ? await prisma.order.findUnique({ where: { id: orderId } })
    : null;

  // Fallback reconciliation: if the webhook hasn't marked it paid yet, confirm
  // directly with Stripe so the page reflects reality even in local dev.
  let paid = order?.paymentStatus === 'paid';
  if (order && !paid && stripe && order.stripeSessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
      if (session.payment_status === 'paid') {
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'paid', status: 'processing' },
        });
        await sendOrderEmails(order.id);
        paid = true;
      }
    } catch { /* ignore — show pending */ }
  }

  return (
    <div className="max-w-[700px] mx-auto px-[15px] py-24 text-center">
      <ClearCartOnMount />
      <div className="text-5xl mb-4">{paid ? '?' : '??'}</div>
      <h1 style={{ fontFamily: hf, fontWeight: 800, fontSize: 28, color: '#9B72C7', marginBottom: 12 }}>
        ?????????? ?? ?????????!
      </h1>
      {order && (
        <p className="text-[var(--text-body)] mb-2">
          ????? ?? ?????????: <strong>#{orderNumber(order.id)}</strong>
        </p>
      )}
      <p className="text-[var(--text-body)] mb-6">
        {paid
          ? '????????? ? ???????? ???????. ?? ?? ??????? ? ??? ?? ??????????.'
          : '????????????? ????????? ??. ??? ????????? ? ?????????, ?? ?? ???????? ???????????.'}
      </p>
      <Link href="/" className="btn-primary inline-block">??????? ??? ??????</Link>
    </div>
  );
}
