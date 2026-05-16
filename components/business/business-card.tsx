import { Link } from '@/i18n/navigation';

interface BusinessCardProps {
  slug: string;
  name: string;
  shortDescription?: string | null;
  category?: string;
  ratingAvg?: number | null;
  ratingCount?: number;
  featured?: boolean;
  priceRange?: string | null;
  image?: string;
  district?: string | null;
}

const PRICE_GLYPH: Record<string, string> = {
  CHEAP: '€',
  MID: '€€',
  HIGH: '€€€',
  LUXURY: '€€€€',
};

export function BusinessCard({
  slug,
  name,
  shortDescription,
  category,
  ratingAvg,
  ratingCount,
  featured,
  priceRange,
  image,
  district,
}: BusinessCardProps) {
  return (
    <Link
      href={`/n/${slug}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-brand-300 hover:shadow-md"
    >
      <div className="aspect-[16/10] w-full bg-linear-to-br from-brand-100 to-brand-50 relative">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-brand-300">📍</div>
        )}
        {featured && (
          <span className="absolute left-3 top-3 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            Destacado
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-brand-700">{name}</h3>
          {priceRange && PRICE_GLYPH[priceRange] && (
            <span className="text-sm font-medium text-gray-500">{PRICE_GLYPH[priceRange]}</span>
          )}
        </div>
        {category && (
          <p className="mt-0.5 text-xs uppercase tracking-wide text-gray-500">
            {category}
            {district ? ` · ${district}` : ''}
          </p>
        )}
        {shortDescription && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-600">{shortDescription}</p>
        )}
        {ratingAvg != null && ratingCount != null && ratingCount > 0 && (
          <div className="mt-3 flex items-center gap-1 text-sm">
            <span className="text-amber-500">★</span>
            <span className="font-medium text-gray-900">{ratingAvg.toFixed(1)}</span>
            <span className="text-gray-500">({ratingCount})</span>
          </div>
        )}
      </div>
    </Link>
  );
}
