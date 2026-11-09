import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5E9AF] px-4">
      <Link href="/" className="mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#235037] hover:scale-105 transition-transform">
          <span className="text-xl font-bold text-white">PTV</span>
        </div>
      </Link>

      <p className="text-8xl font-bold text-[#235037] mb-4 leading-none">
        404
      </p>

      <h1 className="text-2xl font-semibold text-[#1a2e22] mb-2 text-center">
        Page introuvable
      </h1>
      <p className="text-[#5A6B61] text-center mb-8 max-w-sm">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl border border-[#E8E8E8] bg-white text-[#5A6B61] text-sm font-medium hover:bg-[#EEF7F1] transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 rounded-xl bg-[#235037] hover:bg-[#1a3d2a] text-white text-sm font-medium transition-all"
        >
          Mon dashboard
        </Link>
      </div>
    </div>
  )
}
