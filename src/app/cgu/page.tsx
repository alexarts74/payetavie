import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: "Conditions générales d'utilisation — PayeTaVie",
}

export default function CguPage() {
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
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Conditions générales d&apos;utilisation</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-10">Dernière mise à jour : mai 2026</p>

        <div className="space-y-8 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">1. Objet</h2>
            <p>
              Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation du service PayeTaVie, accessible à l&apos;adresse payetavie.fr. En vous inscrivant, vous acceptez sans réserve les présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">2. Description du service</h2>
            <p>
              PayeTaVie est un assistant administratif personnel en ligne qui permet aux utilisateurs de gérer leurs démarches administratives (impôts, assurances, santé, logement, etc.) via des guides, checklists, rappels, stockage de documents et signets. Un module freelance (facturation, devis, gestion clients) est accessible aux abonnés au plan Pro.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">3. Inscription et compte utilisateur</h2>
            <p className="mb-2">
              L&apos;accès au service nécessite la création d&apos;un compte avec une adresse email valide et un mot de passe. Vous êtes responsable de la confidentialité de vos identifiants et de toute activité effectuée depuis votre compte.
            </p>
            <p>
              PayeTaVie se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">4. Plans et abonnements</h2>
            <div className="space-y-3">
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">Plan Gratuit</p>
                <p>Accès limité à 3 sujets, 5 documents, 10 rappels et 5 signets par sujet. Aucun engagement.</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">Plan Essentiel — 4,99 €/mois</p>
                <p>Accès illimité à tous les sujets et fonctionnalités administratives. Abonnement mensuel résiliable à tout moment.</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">Plan Pro — 9,99 €/mois</p>
                <p>Inclut tout le plan Essentiel, plus le module freelance (facturation, devis, gestion clients). Abonnement mensuel résiliable à tout moment.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">5. Paiement et facturation</h2>
            <p className="mb-2">
              Les paiements sont traités par Stripe, prestataire de paiement sécurisé. PayeTaVie ne stocke aucune donnée de carte bancaire. Les abonnements sont prélevés mensuellement, à date d&apos;anniversaire de souscription.
            </p>
            <p>
              En cas de résiliation, l&apos;accès aux fonctionnalités premium est maintenu jusqu&apos;à la fin de la période en cours. Aucun remboursement partiel n&apos;est accordé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">6. Droit de rétractation</h2>
            <p>
              Conformément à l&apos;article L.221-18 du Code de la consommation, vous disposez d&apos;un délai de 14 jours à compter de votre souscription pour exercer votre droit de rétractation, sous réserve que vous n&apos;ayez pas commencé à utiliser le service. Pour exercer ce droit, contactez-nous par email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">7. Responsabilité et garanties</h2>
            <p>
              Le service est fourni &quot;en l&apos;état&quot;. PayeTaVie ne garantit pas une disponibilité ininterrompue et se réserve le droit de procéder à des maintenances. Les informations et guides fournis sont indicatifs et ne constituent pas des conseils professionnels.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">8. Données utilisateur</h2>
            <p>
              Vos données sont stockées de façon sécurisée. En cas de résiliation de votre compte, vous pouvez demander la suppression de toutes vos données. Voir notre{' '}
              <Link href="/politique-confidentialite" className="text-indigo-600 hover:underline">politique de confidentialité</Link>{' '}
              pour plus de détails.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">9. Modification des CGU</h2>
            <p>
              PayeTaVie se réserve le droit de modifier les présentes CGU à tout moment. En cas de modification substantielle, vous serez informé par email au moins 30 jours avant l&apos;entrée en vigueur des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">10. Droit applicable et litiges</h2>
            <p>
              Les présentes CGU sont régies par le droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux français compétents seront saisis.
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
