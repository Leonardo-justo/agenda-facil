import { OwnerDashboard } from "@/components/agenda/OwnerDashboard";
import { RouteGuard } from "@/components/auth/RouteGuard";

export default function InternoPage() {
  return (
    <RouteGuard role="platform">
      <OwnerDashboard />
    </RouteGuard>
  );
}
