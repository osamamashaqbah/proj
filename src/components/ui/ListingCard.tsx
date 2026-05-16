import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { ComplianceRiskBadge, GuaranteedBadge, OfficialBadge, StatusBadge } from "./Badge";

type Props = {
  href: string;
  title: string;
  priceCents: number;
  currency?: string;
  imageUrl?: string | null;
  categoryLabel?: string;
  status?: string;
  badgeLabels: Record<string, string>;
  showOfficial?: boolean;
  showGuarantee?: boolean;
  showRisk?: boolean;
  locale: string;
};

export function ListingCard(p: Props) {
  return (
    <Link href={p.href} className="card card-hover block group">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-bg-elevated mb-3 border border-neon-violet/30 relative">
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.imageUrl}
            alt={p.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl bg-gradient-to-br from-neon-violet/10 via-bg-card to-neon-pink/10">
            🎮
          </div>
        )}
        {/* corner gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card/90 via-transparent to-transparent pointer-events-none" />
      </div>
      <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
        {p.showOfficial && <OfficialBadge label={p.badgeLabels.official ?? "Official"} />}
        {p.showGuarantee && <GuaranteedBadge label={p.badgeLabels.guaranteed ?? "Guaranteed"} />}
        {p.showRisk && <ComplianceRiskBadge label={p.badgeLabels.highRisk ?? "Risk"} />}
        {p.status && <StatusBadge status={p.status} labels={p.badgeLabels} />}
      </div>
      <div className="font-semibold text-silver-bright line-clamp-2 leading-snug group-hover:text-neon-pink transition">
        {p.title}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-display font-bold text-lg bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">
          {formatPrice(p.priceCents, p.currency ?? "USD", p.locale)}
        </span>
        {p.categoryLabel && (
          <span className="text-[10px] uppercase tracking-wider text-silver-muted">{p.categoryLabel}</span>
        )}
      </div>
    </Link>
  );
}
