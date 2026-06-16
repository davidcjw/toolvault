import { ShieldCheck } from "lucide-react";

export function PrivacyBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1.5 font-mono text-xs font-medium text-accent-strong ${className}`}
    >
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
      100% in your browser — nothing uploaded
    </span>
  );
}
