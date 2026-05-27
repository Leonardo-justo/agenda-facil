"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { getCurrentSession } from "@/lib/auth-store";

export function RouteGuard({ children, role }: { children: ReactNode; role: "platform" | "store" }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;
    getCurrentSession().then((session) => {
      if (!mounted) return;
      if (!session) {
        router.replace("/login");
        return;
      }
      if (role === "platform" && session.role !== "platform") {
        router.replace("/painel");
        return;
      }
      if (role === "store" && session.role !== "store" && session.role !== "platform") {
        router.replace("/login");
        return;
      }
      setAllowed(true);
    });
    return () => {
      mounted = false;
    };
  }, [role, router]);

  if (!allowed) {
    return (
      <main className="grid min-h-screen place-items-center bg-canvas p-6">
        <div className="rounded-card border border-line bg-white p-6 font-black text-muted">Validando acesso...</div>
      </main>
    );
  }

  return children;
}
