'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth-client';

export function LoginForm({ locale }: { locale: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await signIn.email({
      email,
      password,
      callbackURL: `/${locale}/dashboard`,
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? 'Credenciales inválidas');
      return;
    }
    router.push(`/${locale}/dashboard`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-xs focus:border-brand-500 focus:outline-hidden"
        />
      </div>
      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {loading ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
