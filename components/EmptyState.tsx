import Link from "next/link";

export default function EmptyState({
  emoji,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-6">
      <div className="w-20 h-20 rounded-full bg-sand-50 flex items-center justify-center text-4xl mb-4">
        {emoji}
      </div>
      <h3 className="text-lg font-bold text-ink-700 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-ink-500 max-w-xs mb-5">{subtitle}</p>}
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md transition-colors"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
