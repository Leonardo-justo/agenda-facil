import { NextRequest, NextResponse } from "next/server";

const planPrices = {
  monthly: { title: "Agenda Facil - 1 mes", price: 79 },
  quarterly: { title: "Agenda Facil - 3 meses", price: 199 },
  annual: { title: "Agenda Facil - 12 meses", price: 599 },
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { planId?: keyof typeof planPrices; businessId?: string; email?: string };
  const plan = body.planId ? planPrices[body.planId] : null;

  if (!plan) {
    return NextResponse.json({ error: "Plano invalido." }, { status: 400 });
  }

  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({
      checkoutUrl: null,
      message: "Checkout preparado. Configure MERCADO_PAGO_ACCESS_TOKEN para gerar links reais.",
    });
  }

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          title: plan.title,
          quantity: 1,
          currency_id: "BRL",
          unit_price: plan.price,
        },
      ],
      payer: {
        email: body.email,
      },
      metadata: {
        business_id: body.businessId,
        plan_id: body.planId,
      },
      back_urls: {
        success: `${request.nextUrl.origin}/painel`,
        failure: `${request.nextUrl.origin}/painel`,
        pending: `${request.nextUrl.origin}/painel`,
      },
      notification_url: `${request.nextUrl.origin}/api/webhooks/mercado-pago`,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json({ error: "Nao foi possivel criar checkout.", details }, { status: 502 });
  }

  const data = await response.json();
  return NextResponse.json({ checkoutUrl: data.init_point ?? data.sandbox_init_point });
}
