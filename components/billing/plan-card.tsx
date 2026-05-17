import { PLANS } from '@/lib/plans';
import type { Plan } from '@prisma/client';

interface Props {
  plan: Plan;
  ctaHref?: string;
  ctaDisabled?: boolean;
  currentLabel?: string;
}

export function PlanCard({ plan, ctaHref, ctaDisabled, currentLabel }: Props) {
  const p = PLANS[plan];
  return (
    <div
      className={`flex flex-col rounded-2xl border p-6 ${
        p.highlight ? 'border-brand-400 bg-brand-50/30 shadow-md' : 'border-gray-200 bg-white'
      }`}
    >
      {p.highlight && (
        <div className="mb-2 inline-block w-fit rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          Más popular
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900">{p.name}</h3>
      <div className="mt-1 text-3xl font-semibold text-gray-900">
        {p.priceLabel}
        {p.priceMonthly > 0 && <span className="ml-1 text-sm font-normal text-gray-500">+ IVA</span>}
      </div>

      <ul className="mt-5 flex-1 space-y-2 text-sm">
        {p.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span aria-hidden="true" className="text-emerald-600">✓</span>
            <span className="text-gray-700">{f}</span>
          </li>
        ))}
        {p.notIncluded?.map((f) => (
          <li key={f} className="flex items-start gap-2 text-gray-400">
            <span aria-hidden="true">·</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        {currentLabel ? (
          <span className="block w-full rounded-md border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">
            {currentLabel}
          </span>
        ) : ctaHref ? (
          <a
            href={ctaHref}
            aria-disabled={ctaDisabled}
            className={`block w-full rounded-md px-4 py-2 text-center text-sm font-medium ${
              p.highlight
                ? 'bg-brand-600 text-white hover:bg-brand-700'
                : 'border border-brand-600 text-brand-700 hover:bg-brand-50'
            } ${ctaDisabled ? 'pointer-events-none opacity-50' : ''}`}
          >
            {p.ctaLabel}
          </a>
        ) : (
          <span className="block w-full rounded-md border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-500">
            {p.ctaLabel}
          </span>
        )}
      </div>
    </div>
  );
}
