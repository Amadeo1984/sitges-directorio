import { getTranslations } from 'next-intl/server';

interface Hour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  note?: string | null;
}

export async function BusinessHours({ hours }: { hours: Hour[] }) {
  const t = await getTranslations('businessHours');
  const labels: string[] = [
    t('sun'),
    t('mon'),
    t('tue'),
    t('wed'),
    t('thu'),
    t('fri'),
    t('sat'),
  ];

  const byDay = new Map<number, Hour[]>();
  for (const h of hours) {
    const arr = byDay.get(h.dayOfWeek) ?? [];
    arr.push(h);
    byDay.set(h.dayOfWeek, arr);
  }

  return (
    <dl className="grid grid-cols-1 gap-1.5 text-sm">
      {[1, 2, 3, 4, 5, 6, 0].map((d) => {
        const dayHours = byDay.get(d);
        return (
          <div key={d} className="flex justify-between gap-4">
            <dt className="text-gray-600">{labels[d]}</dt>
            <dd className="text-gray-900">
              {dayHours && dayHours.length
                ? dayHours.map((h) => `${h.openTime}–${h.closeTime}`).join(', ')
                : t('closed')}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
