'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth-client';

export function RegisterForm({ locale }: { locale: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setLoading(true);
    const { error: err } = await signUp.email({
      email,
      password,
      name,
      callbackURL: `/${locale}/dashboard`,
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? 'No se pudo crear la cuenta');
      return;
    }
    router.push(`/${locale}/dashboard?welcome=1`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-xs focus:border-brand-500 focus:outline-hidden"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-xs focus:border-brand-500 focus:outline-hidden"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-xs focus:border-brand-500 focus:outline-hidden"
        />
        <p className="mt-1 text-xs text-gray-500">Mínimo 8 caracteres.</p>
      </div>
      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {loading ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>
    </form>
  );
}
