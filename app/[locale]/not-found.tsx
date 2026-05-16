import { Link } from '@/i18n/navigation';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-32 text-center">
      <h1 className="text-6xl font-semibold text-brand-700">404</h1>
      <p className="mt-4 text-lg text-gray-600">Página no encontrada</p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-brand-600 px-5 py-2.5 text-white hover:bg-brand-700"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
