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
    <Link href={p.href} className="card card-hover block">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-bg-elevated mb-3 border border-purple-800/30">
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.imageUrl}
            alt={p.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-silver-muted text-sm">
            🎮
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap mb-1">
        {p.showOfficial && <OfficialBadge label={p.badgeLabels.official ?? "Official"} />}
        {p.showGuarantee && <GuaranteedBadge label={p.badgeLabels.guaranteed ?? "Guaranteed"} />}
        {p.showRisk && <ComplianceRiskBadge label={p.badgeLabels.highRisk ?? "Risk"} />}
        {p.status && <StatusBadge status={p.status} labels={p.badgeLabels} />}
      </div>
      <div className="font-medium text-silver-bright line-clamp-2">{p.title}</div>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-purple-300 font-semibold">
          {formatPrice(p.priceCents, p.currency ?? "USD", p.locale)}
        </span>
        {p.categoryLabel && (
          <span className="text-xs text-silver-muted">{p.categoryLabel}</span>
        )}
      </div>
    </Link>
  );
}
