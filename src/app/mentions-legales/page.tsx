import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Mentions légales — PayeTaVie',
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Navbar */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">PTV</span>
            </div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">PayeTaVie</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Mentions légales</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-10">Dernière mise à jour : mai 2026</p>

        <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">1. Éditeur du site</h2>
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              <p><strong>Nom / Raison sociale :</strong> [À compléter — nom de l&apos;auto-entrepreneur ou société]</p>
              <p><strong>SIRET :</strong> [À compléter]</p>
              <p><strong>Adresse :</strong> [À compléter]</p>
              <p><strong>Email :</strong> [À compléter]</p>
              <p><strong>Directeur de la publication :</strong> [À compléter]</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">2. Hébergement</h2>
            <div className="text-sm text-zinc-700 dark:text-zinc-300 space-y-1">
              <p><strong>Hébergeur :</strong> Vercel Inc.</p>
              <p><strong>Adresse :</strong> 340 Pine Street, Suite 701, San Francisco, California 94104, USA</p>
              <p><strong>Site :</strong> vercel.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">3. Propriété intellectuelle</h2>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              L&apos;ensemble des contenus présents sur PayeTaVie (textes, images, logos, structure du site) est protégé par les lois françaises et internationales relatives à la propriété intellectuelle. Toute reproduction, même partielle, est interdite sans autorisation préalable de l&apos;éditeur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">4. Responsabilité</h2>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              Les informations et guides proposés sur PayeTaVie sont fournis à titre indicatif. Ils ne constituent pas des conseils juridiques, fiscaux ou administratifs professionnels. L&apos;éditeur ne saurait être tenu responsable de l&apos;utilisation qui serait faite de ces informations. Pour toute situation particulière, il est recommandé de consulter un professionnel qualifié.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">5. Données personnelles</h2>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              Le traitement des données personnelles est décrit dans notre{' '}
              <Link href="/politique-confidentialite" className="text-indigo-600 hover:underline">politique de confidentialité</Link>.
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement et de portabilité de vos données. Pour exercer ces droits, contactez-nous à l&apos;adresse indiquée ci-dessus.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">6. Cookies</h2>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              PayeTaVie utilise des cookies strictement nécessaires au fonctionnement du service (authentification, préférences). Aucun cookie de traçage publicitaire n&apos;est utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">7. Droit applicable</h2>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400">
          <Link href="/mentions-legales" className="hover:text-zinc-600 transition-colors">Mentions légales</Link>
          <span>·</span>
          <Link href="/cgu" className="hover:text-zinc-600 transition-colors">CGU</Link>
          <span>·</span>
          <Link href="/politique-confidentialite" className="hover:text-zinc-600 transition-colors">Politique de confidentialité</Link>
        </div>
      </footer>
    </div>
  )
}
