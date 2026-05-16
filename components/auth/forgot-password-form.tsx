'use client';

import { useState } from 'react';
import { forgetPassword } from '@/lib/auth-client';

export function ForgotPasswordForm({ locale }: { locale: string }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await forgetPassword({
      email,
      redirectTo: `/${locale}/recuperar/nueva`,
    });
    setLoading(false);
    if (err) {
      setError(err.message ?? 'No se pudo enviar el correo.');
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-md bg-brand-50 px-4 py-3 text-sm text-brand-800">
        Si existe una cuenta con ese email, hemos enviado un enlace para restablecer la contraseña.
        Revisa tu bandeja de entrada.
      </div>
    );
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
      {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {loading ? 'Enviando…' : 'Enviar enlace'}
      </button>
    </form>
  );
}
