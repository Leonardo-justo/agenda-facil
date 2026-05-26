import Link from "next/link";
import type { ReactNode } from "react";
import { clsx } from "clsx";

type NavItem = {
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
};

export function AppShell({
  eyebrow,
  title,
  nav,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  nav: NavItem[];
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <main className="grid min-h-screen grid-cols-[250px_minmax(0,1fr)] bg-canvas max-lg:grid-cols-1">
      <aside className="sticky top-0 flex h-screen flex-col justify-between border-r border-line bg-white p-6 max-lg:static max-lg:h-auto max-lg:gap-5">
        <div>
          <p className="text-xs font-black uppercase text-brand">{eyebrow}</p>
          <h1 className="mt-1 text-2xl font-black">{title}</h1>
          <nav className="mt-7 grid gap-2 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {nav.map((item) =>
              item.href ? (
                <Link key={item.label} href={item.href} className={navClass(item.active)}>
                  {item.label}
                </Link>
              ) : (
                <button key={item.label} type="button" onClick={item.onClick} className={navClass(item.active)}>
                  {item.label}
                </button>
              ),
            )}
          </nav>
        </div>
        {action}
      </aside>
      <section className="min-w-0 p-6">{children}</section>
    </main>
  );
}

function navClass(active?: boolean) {
  return clsx(
    "rounded-card border px-4 py-3 text-left text-sm font-black transition",
    active ? "border-brand/30 bg-brand/10 text-brand" : "border-transparent text-ink hover:border-line hover:bg-canvas",
  );
}

export function ButtonLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex min-h-11 items-center justify-center rounded-card bg-brand px-4 font-black text-white">
      {children}
    </Link>
  );
}

export function PrimaryButton({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  return (
    <button disabled={disabled} className="min-h-11 rounded-card bg-brand px-4 font-black text-white disabled:cursor-not-allowed disabled:opacity-50">
      {children}
    </button>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={clsx("rounded-card border border-line bg-white p-5", className)}>{children}</section>;
}

export function MetricCard({ label, value, tone = "default" }: { label: string; value: string | number; tone?: "default" | "green" | "rust" }) {
  return (
    <article
      className={clsx(
        "grid min-h-28 gap-2 rounded-card border p-5",
        tone === "green" && "border-brand/30 bg-brand/10",
        tone === "rust" && "border-rust/30 bg-rust/10",
        tone === "default" && "border-line bg-white",
      )}
    >
      <span className="font-extrabold text-muted">{label}</span>
      <strong className="text-3xl font-black">{value}</strong>
    </article>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-card border border-dashed border-line bg-canvas p-4 text-sm font-bold text-muted">{children}</div>;
}
