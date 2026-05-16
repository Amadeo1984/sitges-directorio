'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Photo {
  id: string;
  url: string;
  isPrimary: boolean;
  position: number;
}

export function PhotoManager({
  businessId,
  initialPhotos,
}: {
  businessId: string;
  initialPhotos: Photo[];
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [_, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadOne(file: File) {
    const meta = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        businessId,
        filename: file.name,
        contentType: file.type,
        size: file.size,
      }),
    });
    if (!meta.ok) {
      const j = await meta.json().catch(() => ({}));
      throw new Error(j.error?.fieldErrors?.contentType?.[0] ?? 'No se pudo iniciar la subida.');
    }
    const { uploadUrl, key, publicUrl } = await meta.json();

    const put = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'content-type': file.type },
      body: file,
    });
    if (!put.ok) throw new Error('La subida al storage falló.');

    const create = await fetch(`/api/businesses/${businessId}/photos`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ key, url: publicUrl }),
    });
    if (!create.ok) throw new Error('No se pudo registrar la foto.');
    const { media } = await create.json();
    return media as Photo;
  }

  async function onFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const added: Photo[] = [];
      for (const file of Array.from(files)) {
        if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) {
          throw new Error(`Formato no soportado: ${file.name}`);
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`${file.name} supera 10 MB`);
        }
        const m = await uploadOne(file);
        added.push(m);
      }
      setPhotos((prev) => [...prev, ...added]);
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error subiendo fotos.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function setPrimary(mediaId: string) {
    await fetch(`/api/businesses/${businessId}/photos`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mediaId, isPrimary: true }),
    });
    setPhotos((prev) => prev.map((p) => ({ ...p, isPrimary: p.id === mediaId })));
    startTransition(() => router.refresh());
  }

  async function remove(mediaId: string) {
    if (!confirm('¿Eliminar esta foto?')) return;
    await fetch(`/api/businesses/${businessId}/photos?mediaId=${mediaId}`, { method: 'DELETE' });
    setPhotos((prev) => prev.filter((p) => p.id !== mediaId));
    startTransition(() => router.refresh());
  }

  return (
    <fieldset className="rounded-2xl border border-gray-200 bg-white p-6">
      <legend className="text-base font-semibold text-gray-900">Fotos</legend>
      <p className="mt-2 text-sm text-gray-600">JPG/PNG/WebP/AVIF · máx 10 MB. La primera es la portada.</p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((p) => (
          <div key={p.id} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" className="h-full w-full object-cover" />
            {p.isPrimary && (
              <span className="absolute left-2 top-2 rounded bg-amber-500 px-1.5 py-0.5 text-xs font-medium text-white">
                Portada
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/40 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
              {!p.isPrimary && (
                <button type="button" onClick={() => setPrimary(p.id)} className="hover:underline">
                  Hacer portada
                </button>
              )}
              <button type="button" onClick={() => remove(p.id)} className="ml-auto hover:underline">
                Eliminar
              </button>
            </div>
          </div>
        ))}

        <label
          className={`flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed text-sm text-gray-500 hover:border-brand-400 hover:text-brand-700 ${
            uploading ? 'opacity-60' : ''
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={(e) => onFilesSelected(e.target.files)}
            className="sr-only"
            disabled={uploading}
          />
          <span className="text-2xl">{uploading ? '⏳' : '+'}</span>
          <span className="mt-1">{uploading ? 'Subiendo…' : 'Añadir foto'}</span>
        </label>
      </div>

      {error && <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
    </fieldset>
  );
}
