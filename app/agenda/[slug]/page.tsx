import { PublicBooking } from "@/components/agenda/PublicBooking";

export default async function PublicAgendaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicBooking slug={slug} />;
}
