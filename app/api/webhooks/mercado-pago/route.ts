import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => ({}));

  // Em producao, este webhook deve consultar o pagamento no Mercado Pago,
  // validar status, gravar em payment_events e ativar/cancelar a loja.
  return NextResponse.json({
    received: true,
    provider: "mercado_pago",
    reference: payload?.data?.id ?? payload?.id ?? null,
  });
}
