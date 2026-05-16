'use client';

import { useState, useTransition } from 'react';
import { useForm, useFieldArray, Controller, type Resolver, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { businessSchema, type BusinessInput } from '@/lib/validations/business';
import { createBusiness, updateBusiness, submitForReview } from '@/app/[locale]/dashboard/negocios/actions';

interface CategoryOpt {
  id: string;
  label: string;
  parentLabel?: string;
}
interface TagOpt {
  key: string;
  label: string;
}

interface Props {
  locale: string;
  categories: CategoryOpt[];
  tags: TagOpt[];
  business?: {
    id: string;
    status: string;
    defaults: BusinessInput;
  };
}

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function BusinessForm({ locale, categories, tags, business }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<BusinessInput>({
    resolver: zodResolver(businessSchema) as unknown as Resolver<BusinessInput>,
    defaultValues:
      business?.defaults ?? {
        categoryId: '',
        name: '',
        shortDescription: '',
        description: '',
        phone: '',
        email: '',
        website: '',
        whatsapp: '',
        instagram: '',
        facebook: '',
        address: '',
        postalCode: '',
        district: '',
        priceRange: undefined,
        tagKeys: [],
        hours: [],
      },
  });

  const { control, register, handleSubmit, formState: { errors }, watch, setValue } = form;
  const { fields, append, remove } = useFieldArray({ control, name: 'hours' });
  const tagKeys = watch('tagKeys') ?? [];

  function toggleTag(key: string) {
    const set = new Set(tagKeys);
    if (set.has(key)) set.delete(key);
    else set.add(key);
    setValue('tagKeys', Array.from(set), { shouldDirty: true });
  }

  const onSubmit: SubmitHandler<BusinessInput> = function (data) {
    startTransition(async () => {
      setServerError(null);
      setSavedMsg(null);
      const result = business
        ? await updateBusiness(business.id, data)
        : await createBusiness(data);
      if (!result.ok) {
        setServerError(result.formError ?? 'No se pudo guardar.');
        return;
      }
      setSavedMsg('Guardado.');
      if (!business) router.push(`/${locale}/dashboard/negocios/${result.id}`);
      else router.refresh();
    });
  };

  async function onSubmitForReview() {
    if (!business) return;
    setServerError(null);
    setSavedMsg(null);
    startTransition(async () => {
      const r = await submitForReview(business.id);
      if (!r.ok) setServerError(r.formError ?? 'No se pudo enviar a revisión.');
      else {
        setSavedMsg('Enviado a revisión.');
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Section title="Información básica">
        <Field label="Nombre" error={errors.name?.message}>
          <input {...register('name')} className={inputCls} />
        </Field>
        <Field label="Categoría" error={errors.categoryId?.message}>
          <select {...register('categoryId')} className={inputCls}>
            <option value="">Selecciona…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parentLabel ? `${c.parentLabel} · ${c.label}` : c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Descripción corta (máx. 180)" error={errors.shortDescription?.message}>
          <input {...register('shortDescription')} maxLength={180} className={inputCls} />
        </Field>
        <Field label="Descripción larga" error={errors.description?.message}>
          <textarea {...register('description')} rows={6} className={inputCls} />
        </Field>
        <Field label="Rango de precio">
          <select {...register('priceRange')} className={inputCls}>
            <option value="">No especificado</option>
            <option value="CHEAP">€ (económico)</option>
            <option value="MID">€€ (medio)</option>
            <option value="HIGH">€€€ (alto)</option>
            <option value="LUXURY">€€€€ (lujo)</option>
          </select>
        </Field>
      </Section>

      <Section title="Contacto">
        <Field label="Teléfono"><input {...register('phone')} className={inputCls} /></Field>
        <Field label="Email"><input {...register('email')} className={inputCls} /></Field>
        <Field label="Web"><input {...register('website')} placeholder="https://…" className={inputCls} /></Field>
        <Field label="WhatsApp"><input {...register('whatsapp')} className={inputCls} /></Field>
        <Field label="Instagram"><input {...register('instagram')} placeholder="@usuario" className={inputCls} /></Field>
        <Field label="Facebook"><input {...register('facebook')} placeholder="url" className={inputCls} /></Field>
      </Section>

      <Section title="Ubicación">
        <Field label="Dirección" error={errors.address?.message}>
          <input {...register('address')} className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Código postal">
            <input {...register('postalCode')} className={inputCls} />
          </Field>
          <Field label="Barrio">
            <input {...register('district')} className={inputCls} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitud" error={errors.lat?.message}>
            <input {...register('lat')} type="number" step="any" className={inputCls} />
          </Field>
          <Field label="Longitud" error={errors.lng?.message}>
            <input {...register('lng')} type="number" step="any" className={inputCls} />
          </Field>
        </div>
      </Section>

      <Section title="Etiquetas">
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => {
            const active = tagKeys.includes(t.key);
            return (
              <button
                type="button"
                key={t.key}
                onClick={() => toggleTag(t.key)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  active
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-brand-300'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Horarios">
        <p className="text-sm text-gray-600">Añade un tramo por día (puedes añadir varios al mismo día para partidos).</p>
        <div className="mt-3 space-y-2">
          {fields.map((field, idx) => (
            <div key={field.id} className="flex flex-wrap items-center gap-2">
              <Controller
                control={control}
                name={`hours.${idx}.dayOfWeek` as const}
                render={({ field: f }) => (
                  <select
                    value={f.value}
                    onChange={(e) => f.onChange(Number(e.target.value))}
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                  >
                    {DAY_LABELS.map((d, i) => (
                      <option key={i} value={i}>{d}</option>
                    ))}
                  </select>
                )}
              />
              <input
                type="time"
                {...register(`hours.${idx}.openTime`)}
                className="rounded-md border border-gray-300 px-2 py-1 text-sm"
              />
              <span className="text-gray-500">–</span>
              <input
                type="time"
                {...register(`hours.${idx}.closeTime`)}
                className="rounded-md border border-gray-300 px-2 py-1 text-sm"
              />
              <button type="button" onClick={() => remove(idx)} className="text-sm text-red-600 hover:underline">
                Eliminar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ dayOfWeek: 1, openTime: '09:00', closeTime: '20:00' })}
            className="text-sm text-brand-700 hover:underline"
          >
            + Añadir horario
          </button>
        </div>
      </Section>

      {(serverError || savedMsg) && (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            serverError ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          {serverError ?? savedMsg}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {isPending ? 'Guardando…' : business ? 'Guardar cambios' : 'Crear y continuar'}
        </button>
        {business && business.status !== 'PUBLISHED' && business.status !== 'PENDING_REVIEW' && (
          <button
            type="button"
            onClick={onSubmitForReview}
            disabled={isPending}
            className="rounded-md border border-brand-600 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50"
          >
            Enviar a revisión
          </button>
        )}
        {business?.status === 'PENDING_REVIEW' && (
          <span className="text-sm text-amber-700">En revisión por el equipo</span>
        )}
        {business?.status === 'PUBLISHED' && (
          <span className="text-sm text-emerald-700">Publicado</span>
        )}
      </div>
    </form>
  );
}

const inputCls =
  'block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-xs focus:border-brand-500 focus:outline-hidden';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-gray-200 bg-white p-6">
      <legend className="text-base font-semibold text-gray-900">{title}</legend>
      <div className="mt-4 space-y-4">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
