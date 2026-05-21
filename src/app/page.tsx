import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Sparkles,
  CheckSquare,
  Bell,
  FolderOpen,
  TrendingDown,
  BookMarked,
  Check,
  ChevronDown,
  Receipt,
  Briefcase,
  HeartPulse,
  Banknote,
  Users,
  House,
  ShieldCheck,
} from 'lucide-react'
import LandingNavbar from '@/components/LandingNavbar'
import { ForceLightMode } from '@/components/ForceLightMode'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const topics = [
    {
      name: 'Impôts',
      icon: Receipt,
      color: 'bg-indigo-600/10 text-indigo-600',
      description: 'Déclaration, taux, remboursements et avis d\'imposition expliqués simplement.',
    },
    {
      name: 'URSSAF',
      icon: Briefcase,
      color: 'bg-violet-600/10 text-violet-600',
      description: 'Cotisations sociales, auto-entrepreneur, régularisations sans jargon.',
    },
    {
      name: 'Mutuelle',
      icon: HeartPulse,
      color: 'bg-purple-600/10 text-purple-600',
      description: 'Choisir, comparer et résilier votre mutuelle en toute confiance.',
    },
    {
      name: 'Fiches de paie',
      icon: Banknote,
      color: 'bg-indigo-600/10 text-indigo-600',
      description: 'Comprendre chaque ligne de votre bulletin de salaire.',
    },
    {
      name: 'CAF',
      icon: Users,
      color: 'bg-violet-600/10 text-violet-600',
      description: 'APL, RSA, allocations familiales : vos droits à portée de main.',
    },
    {
      name: 'Logement',
      icon: House,
      color: 'bg-purple-600/10 text-purple-600',
      description: 'Bail, dépôt de garantie, état des lieux et droits du locataire.',
    },
    {
      name: 'Assurances',
      icon: ShieldCheck,
      color: 'bg-indigo-600/10 text-indigo-600',
      description: 'Habitation, auto, responsabilité civile : gérez tout en un endroit.',
    },
  ]

  const features = [
    {
      icon: Sparkles,
      title: 'Guides TL;DR clairs',
      description: 'Des résumés courts et percutants pour comprendre l\'essentiel en 30 secondes, sans lire 10 pages de documentation.',
    },
    {
      icon: CheckSquare,
      title: 'Checklists interactives',
      description: 'Des listes d\'actions concrètes et cochables pour ne rien oublier à chaque démarche administrative.',
    },
    {
      icon: Bell,
      title: 'Rappels & calendrier',
      description: 'Recevez des alertes avant les échéances importantes : déclaration d\'impôts, renouvellement de contrats, etc.',
    },
    {
      icon: FolderOpen,
      title: 'Stockage de documents',
      description: 'Centralisez vos documents importants (contrats, quittances, avis) et retrouvez-les en deux clics.',
    },
    {
      icon: TrendingDown,
      title: 'Suivi des dépenses',
      description: 'Suivez vos dépenses par catégorie, définissez des budgets et identifiez où va votre argent.',
    },
    {
      icon: BookMarked,
      title: 'Annuaire & ressources',
      description: 'Tous les liens officiels, numéros utiles et organismes classés par thématique.',
    },
  ]

  const steps = [
    {
      number: '01',
      title: 'Créez votre compte',
      description: 'Inscription en 30 secondes, sans carte bancaire. Votre compte gratuit est actif immédiatement.',
    },
    {
      number: '02',
      title: 'Choisissez vos thématiques',
      description: 'Sélectionnez les domaines qui vous concernent : impôts, mutuelle, logement, etc.',
    },
    {
      number: '03',
      title: 'Gérez votre vie admin',
      description: 'Accédez aux guides, cochez les tâches, ajoutez vos documents et configurez vos rappels.',
    },
  ]

  const plans = [
    {
      name: 'Gratuit',
      price: '0€',
      period: 'pour toujours',
      description: 'Pour découvrir PayeTaVie',
      features: [
        '3 thématiques au choix',
        '5 documents stockés',
        '10 rappels actifs',
        'Checklists & guides TL;DR',
        'Accès à l\'annuaire',
      ],
      cta: 'Commencer gratuitement',
      ctaHref: '/auth/register',
      highlighted: false,
    },
    {
      name: 'Essentiel',
      price: '4,99€',
      period: '/mois',
      description: 'Pour gérer toute votre vie admin',
      features: [
        'Thématiques illimitées',
        'Documents illimités',
        'Rappels illimités',
        'Suivi dépenses & budgets',
        'Export calendrier iCal',
        'Notifications email',
      ],
      cta: 'Commencer',
      ctaHref: '/auth/register',
      highlighted: true,
    },
    {
      name: 'Pro',
      price: '9,99€',
      period: '/mois',
      description: 'Pour les freelances & indépendants',
      features: [
        'Tout l\'Essentiel inclus',
        'Module facturation',
        'Gestion des devis',
        'Gestion des clients',
        'Profil professionnel',
        'PDF factures & devis',
      ],
      cta: 'Commencer',
      ctaHref: '/auth/register',
      highlighted: false,
    },
  ]

  return (
    <div className="min-h-screen">
      <ForceLightMode />
      <LandingNavbar />

      {/* ── Hero ── */}
      <section id="hero" className="relative overflow-hidden pt-16">
        {/* Background orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-36 text-center">
          <div className="animate-fade-in">
            {/* Category badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-8">
              <Sparkles size={14} />
              Assistant administratif IA-powered
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
              La vie adulte,{' '}
              <br className="hidden sm:block" />
              <span className="gradient-text">sans la prise de tête</span>
            </h1>

            <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10">
              PayeTaVie simplifie toutes vos démarches administratives : impôts, mutuelle, logement, CAF et bien plus. Des guides clairs, des checklists pratiques, zéro jargon.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-colors"
              >
                Créer mon compte — c&apos;est gratuit
              </Link>
              <a
                href="#fonctionnalites"
                className="px-8 py-4 glass-card font-semibold rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-colors"
              >
                Voir les fonctionnalités
              </a>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
            <ChevronDown size={24} className="text-zinc-500" />
          </div>
        </div>
      </section>

      {/* ── Chiffres ── */}
      <section id="chiffres" className="py-20 sm:py-28 border-y border-[var(--glass-border)] glass-card-heavy [scroll-margin-top:4rem]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: '7', label: 'thématiques couvertes' },
              { value: '100%', label: 'guidé pas à pas' },
              { value: '0', label: 'jargon administratif' },
              { value: '30s', label: 'pour comprendre l\'essentiel' },
            ].map((stat) => (
              <div key={stat.label} className="animate-fade-in">
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fonctionnalités ── */}
      <section id="fonctionnalites" className="py-20 sm:py-28 [scroll-margin-top:4rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 animate-slide-up">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Tout ce qu&apos;il vous faut,{' '}
              <span className="gradient-text">au même endroit</span>
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Des outils pensés pour simplifier votre quotidien administratif, sans vous noyer sous les informations.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon
              return (
                <div
                  key={feat.title}
                  className="glass-card rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-200 animate-slide-up"
                  style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/15 flex items-center justify-center mb-4">
                    <Icon size={22} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{feat.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{feat.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Thématiques ── */}
      <section id="thematiques" className="py-20 sm:py-28 bg-zinc-50/50 border-y border-[var(--glass-border)] [scroll-margin-top:4rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 animate-slide-up">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Les thématiques{' '}
              <span className="gradient-text">couvertes</span>
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Chaque domaine de la vie administrative adulte traité en profondeur, avec des guides à jour.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {topics.map((topic, i) => (
              <div
                key={topic.name}
                className="glass-card rounded-2xl p-5 hover:-translate-y-1 transition-transform duration-200 animate-slide-up group"
                style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${topic.color}`}>
                  <topic.icon size={20} />
                </div>
                <h3 className="font-semibold text-zinc-900 mb-1 group-hover:text-indigo-600 transition-colors">
                  {topic.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{topic.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section id="comment" className="py-20 sm:py-28 [scroll-margin-top:4rem]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 animate-slide-up">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Comment ça{' '}
              <span className="gradient-text">marche ?</span>
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
              Démarrez en moins de deux minutes.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className="text-center animate-slide-up"
                style={{ animationDelay: `${i * 0.15}s`, opacity: 0 }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-lg mb-4 shadow-lg shadow-indigo-500/25">
                  {step.number}
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tarifs ── */}
      <section id="tarifs" className="py-20 sm:py-28 bg-zinc-50/50 border-y border-[var(--glass-border)] [scroll-margin-top:4rem]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 animate-slide-up">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Des plans{' '}
              <span className="gradient-text">simples et transparents</span>
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
              Commencez gratuitement. Passez au plan supérieur quand vous en avez besoin.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 animate-slide-up flex flex-col ${
                  plan.highlighted
                    ? 'glass-card border-2 border-indigo-500 dark:border-indigo-400'
                    : 'glass-card'
                }`}
                style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full">
                    Populaire
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{plan.name}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{plan.price}</span>
                    <span className="text-sm text-zinc-500">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                      <Check size={15} className="text-indigo-500 shrink-0 mt-0.5" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaHref}
                  className={`block w-full py-3 text-center rounded-xl font-medium transition-all text-sm ${
                    plan.highlighted
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="py-20 sm:py-28 bg-indigo-600 dark:bg-indigo-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Prêt à reprendre le contrôle de votre vie admin ?
          </h2>
          <p className="text-indigo-100 text-lg mb-8">
            Rejoignez PayeTaVie gratuitement et simplifiez vos démarches dès aujourd&apos;hui.
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Créer mon compte gratuit
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--glass-border)] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">PTV</span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">PayeTaVie</span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">— La vie admin, simplifiée.</span>
            </div>

            <nav className="flex items-center gap-6">
              <a href="#tarifs" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Tarifs
              </a>
              <Link href="/auth/login" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Connexion
              </Link>
              <Link href="/auth/register" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Inscription
              </Link>
            </nav>
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--glass-border)] text-center">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              © {new Date().getFullYear()} PayeTaVie. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
