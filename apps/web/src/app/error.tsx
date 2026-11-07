'use client'

import Link from 'next/link'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-indigo-50/40 to-violet-50/30 px-4">
      <Link href="/" className="mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/35 hover:scale-105 transition-transform">
          <span className="text-xl font-bold text-white">PTV</span>
        </div>
      </Link>

      <p className="text-8xl font-bold bg-gradient-to-br from-indigo-500 to-violet-600 bg-clip-text text-transparent mb-4 leading-none">
        Oops
      </p>

      <h1 className="text-2xl font-semibold text-zinc-900 mb-2 text-center">
        Une erreur est survenue
      </h1>
      <p className="text-zinc-500 text-center mb-8 max-w-sm">
        Quelque chose s&apos;est mal passé. Réessayez ou revenez à l&apos;accueil.
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 text-sm font-medium hover:bg-zinc-50 transition-colors"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/25 transition-all"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  )
}
