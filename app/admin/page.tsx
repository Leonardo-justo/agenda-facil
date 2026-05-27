import { OwnerDashboard } from "@/components/agenda/OwnerDashboard";
import { RouteGuard } from "@/components/auth/RouteGuard";

export default function AdminPage() {
  return (
    <RouteGuard role="platform">
      <OwnerDashboard />
    </RouteGuard>
  );
}
