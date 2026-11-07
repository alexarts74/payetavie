import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Politique de confidentialité — PayeTaVie',
}

export default function PolitiqueConfidentialitePage() {
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
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Politique de confidentialité</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-10">Dernière mise à jour : mai 2026</p>

        <div className="space-y-8 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données personnelles collectées via PayeTaVie est : [À compléter — nom, adresse, email de contact].
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">2. Données collectées</h2>
            <p className="mb-3">Nous collectons les données suivantes :</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li><strong>Données de compte :</strong> adresse email, mot de passe (haché)</li>
              <li><strong>Données de profil :</strong> préférences, sujets sélectionnés</li>
              <li><strong>Données administratives :</strong> rappels, documents (métadonnées et fichiers), signets, checklists, dépenses</li>
              <li><strong>Données freelance (plan Pro) :</strong> informations clients, factures, devis, profil professionnel (SIRET, IBAN)</li>
              <li><strong>Données de paiement :</strong> gérées exclusivement par Stripe — nous n&apos;accédons pas à vos données bancaires</li>
              <li><strong>Données techniques :</strong> logs de connexion, préférences de thème</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">3. Finalités du traitement</h2>
            <p className="mb-2">Vos données sont utilisées pour :</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Fournir et améliorer le service PayeTaVie</li>
              <li>Gérer votre compte et votre abonnement</li>
              <li>Envoyer des notifications et rappels (si activés)</li>
              <li>Respecter nos obligations légales et fiscales</li>
              <li>Assurer la sécurité du service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">4. Base légale</h2>
            <p>
              Le traitement de vos données repose sur l&apos;exécution du contrat (utilisation du service), votre consentement (notifications), et nos obligations légales (facturation).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">5. Sous-traitants et transferts</h2>
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <p><strong>Supabase</strong> — Stockage des données et authentification (hébergé dans l&apos;UE)</p>
              <p><strong>Stripe</strong> — Paiements et facturation (conforme PCI DSS)</p>
              <p><strong>Vercel</strong> — Hébergement de l&apos;application (USA — clauses contractuelles types)</p>
              <p><strong>Resend</strong> — Envoi d&apos;emails transactionnels</p>
            </div>
            <p className="mt-3">
              Aucune donnée n&apos;est vendue à des tiers. Aucune donnée n&apos;est utilisée à des fins publicitaires.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">6. Durée de conservation</h2>
            <p>
              Vos données sont conservées pendant toute la durée de votre compte, puis supprimées dans un délai de 30 jours suivant la clôture, sauf obligation légale contraire (données comptables conservées 10 ans).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">7. Vos droits (RGPD)</h2>
            <p className="mb-2">Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li><strong>Droit d&apos;accès</strong> — obtenir une copie de vos données</li>
              <li><strong>Droit de rectification</strong> — corriger vos données inexactes</li>
              <li><strong>Droit à l&apos;effacement</strong> — supprimer votre compte et vos données</li>
              <li><strong>Droit à la portabilité</strong> — recevoir vos données dans un format structuré</li>
              <li><strong>Droit d&apos;opposition</strong> — vous opposer à certains traitements</li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, contactez-nous à : [À compléter — email]. Vous pouvez également introduire une réclamation auprès de la CNIL (cnil.fr).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">8. Sécurité</h2>
            <p>
              Vos données sont protégées par des mesures de sécurité techniques (chiffrement HTTPS, Row-Level Security en base de données, mots de passe hachés). Vous êtes responsable de la confidentialité de votre mot de passe.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">9. Cookies</h2>
            <p>
              PayeTaVie utilise uniquement des cookies strictement nécessaires au fonctionnement du service (session d&apos;authentification, préférences de thème). Aucun cookie tiers à des fins publicitaires ou analytiques n&apos;est déposé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">10. Modifications</h2>
            <p>
              Cette politique peut être mise à jour. En cas de modification substantielle, vous serez informé par email. La version en vigueur est toujours disponible sur cette page.
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
