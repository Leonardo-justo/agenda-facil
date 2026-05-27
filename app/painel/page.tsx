import { ClientPanel } from "@/components/agenda/ClientPanel";
import { RouteGuard } from "@/components/auth/RouteGuard";

export default function PainelPage() {
  return (
    <RouteGuard role="store">
      <ClientPanel />
    </RouteGuard>
  );
}
