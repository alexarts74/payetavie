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
import { AnimateOnScroll } from '@/components/AnimateOnScroll'

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
      description: 'Déclaration, taux marginal, crédits d\'impôt — tout devient limpide en moins d\'une minute.',
    },
    {
      name: 'URSSAF',
      icon: Briefcase,
      color: 'bg-violet-600/10 text-violet-600',
      description: 'Cotisations, auto-entrepreneur, régularisations — sans jamais vous perdre dans le jargon.',
    },
    {
      name: 'Mutuelle',
      icon: HeartPulse,
      color: 'bg-purple-600/10 text-purple-600',
      description: 'Choisissez, comparez, résiliez — reprenez la main sur votre couverture santé.',
    },
    {
      name: 'Fiches de paie',
      icon: Banknote,
      color: 'bg-indigo-600/10 text-indigo-600',
      description: 'Décryptez chaque ligne de votre bulletin et vérifiez que tout est correct.',
    },
    {
      name: 'CAF',
      icon: Users,
      color: 'bg-violet-600/10 text-violet-600',
      description: 'APL, RSA, allocations — découvrez tout ce à quoi vous avez droit.',
    },
    {
      name: 'Logement',
      icon: House,
      color: 'bg-purple-600/10 text-purple-600',
      description: 'Bail, dépôt de garantie, état des lieux — défendez vos droits de locataire.',
    },
    {
      name: 'Assurances',
      icon: ShieldCheck,
      color: 'bg-indigo-600/10 text-indigo-600',
      description: 'Habitation, auto, RC pro — tout vos contrats gérés en un seul endroit.',
    },
  ]

  const features = [
    {
      icon: Sparkles,
      title: 'Guides ultra-clairs',
      description: 'Fini les textes de loi indigestes — on a tout décrypté pour vous. L\'essentiel en 30 secondes, actionnable immédiatement.',
    },
    {
      icon: CheckSquare,
      title: 'Checklists actionnables',
      description: 'Des listes de tâches concrètes et cochables pour ne rien oublier, étape par étape.',
    },
    {
      icon: Bell,
      title: 'Rappels intelligents',
      description: 'Recevez des alertes avant les échéances critiques : déclaration d\'impôts, renouvellements, expirations de documents.',
    },
    {
      icon: FolderOpen,
      title: 'Coffre-fort documentaire',
      description: 'Centralisez contrats, quittances et avis d\'imposition. Retrouvez n\'importe quel document en deux secondes.',
    },
    {
      icon: TrendingDown,
      title: 'Suivi budgétaire',
      description: 'Visualisez vos dépenses par catégorie, posez des limites de budget et repérez les postes à optimiser.',
    },
    {
      icon: BookMarked,
      title: 'Ressources officielles',
      description: 'Tous les liens officiels, numéros utiles et organismes de référence, classés et vérifiés par thématique.',
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
      title: 'Personnalisez votre espace',
      description: 'Choisissez uniquement les thématiques qui vous concernent — impôts, mutuelle, logement, freelance…',
    },
    {
      number: '03',
      title: 'Prenez le contrôle',
      description: 'Cochez vos tâches, stockez vos documents, activez vos rappels. Votre vie admin, enfin maîtrisée.',
    },
  ]

  const plans = [
    {
      name: 'Gratuit',
      price: '0€',
      period: 'pour toujours',
      description: 'Testez sans engagement',
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
      description: 'Gérez sereinement tout votre admin',
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
      description: 'Freelances & indépendants, tout inclus',
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
        {/* Dot grid background */}
        <div className="absolute inset-0 landing-dot-grid opacity-60" />
        {/* Background orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        {/* Fade-out bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-40 text-center">
          <div className="animate-fade-in">
            {/* Category badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-sm font-medium text-indigo-700 mb-10 animate-[pulse-ring_3s_ease-in-out_infinite]">
              <Sparkles size={13} />
              Votre assistant administratif personnel
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-[5.25rem] font-extrabold tracking-tight mb-7 leading-[1.05]">
              La vie adulte,{' '}
              <br className="hidden sm:block" />
              <em className="not-italic" style={{
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #6366f1)',
                backgroundSize: '200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradient-pan 4s ease infinite',
              }}>sans la prise de tête</em>
            </h1>

            <p className="text-lg sm:text-xl text-zinc-500 max-w-xl mx-auto mb-11 leading-relaxed">
              Impôts, mutuelle, logement, CAF… Arrêtez de subir. Des fiches ultra-claires, des checklists actionnables et des rappels automatiques. Zéro jargon.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/auth/register"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/30 transition-all hover:shadow-indigo-500/40 hover:-translate-y-0.5"
              >
                Commencer gratuitement
                <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
              </Link>
              <a
                href="#comment"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-zinc-600 font-medium hover:text-zinc-900 hover:bg-zinc-100 transition-all"
              >
                Voir comment ça marche
              </a>
            </div>

            {/* Social proof micro-line */}
            <p className="mt-8 text-xs text-zinc-400 tracking-wide">
              Gratuit · Sans carte bancaire · Actif en 30 secondes
            </p>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
            <ChevronDown size={22} className="text-zinc-400" />
          </div>
        </div>
      </section>

      {/* ── Chiffres ── */}
      <section id="chiffres" className="[scroll-margin-top:4rem] border-y border-zinc-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-zinc-100">
            {[
              { value: '7+', label: 'domaines couverts', accent: '#4f46e5' },
              { value: '< 1 min', label: 'pour saisir l\'essentiel', accent: '#7c3aed' },
              { value: '0€', label: 'pour commencer', accent: '#6d28d9' },
              { value: '100%', label: 'orienté action', accent: '#4338ca' },
            ].map((stat, i) => (
              <AnimateOnScroll key={stat.label} delay={i * 0.1}>
                <div className="py-10 px-6 sm:px-8 text-center group">
                  <div
                    className="text-4xl sm:text-5xl font-black mb-2 leading-none tabular-nums tracking-tight"
                    style={{ color: stat.accent }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-zinc-400 font-medium uppercase tracking-wider leading-snug">
                    {stat.label}
                  </div>
                </div>
              </AnimateOnScroll>
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, i) => {
              const Icon = feat.icon
              return (
                <AnimateOnScroll key={feat.title} delay={i * 0.08}>
                  <div className="group relative rounded-2xl p-6 border border-zinc-100 bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/08 hover:-translate-y-1 transition-all duration-200 h-full">
                    {/* Number badge */}
                    <span className="absolute top-5 right-5 text-xs font-bold text-zinc-200 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                      style={{ background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)' }}>
                      <Icon size={20} className="text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-zinc-900 mb-2 group-hover:text-indigo-700 transition-colors">{feat.title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{feat.description}</p>
                  </div>
                </AnimateOnScroll>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Thématiques ── */}
      <section id="thematiques" className="py-20 sm:py-28 bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-700 [scroll-margin-top:4rem] relative overflow-hidden">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.15),transparent_60%)] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 animate-slide-up">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
              Les thématiques{' '}
              <span className="bg-gradient-to-r from-violet-200 to-indigo-200 bg-clip-text text-transparent">couvertes</span>
            </h2>
            <p className="text-lg text-indigo-100/80 max-w-2xl mx-auto">
              Chaque domaine de la vie administrative adulte traité en profondeur, avec des guides à jour.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {topics.map((topic, i) => (
              <AnimateOnScroll key={topic.name} delay={i * 0.07}>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 hover:-translate-y-1 transition-transform duration-200 group h-full">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-white/90 shadow-sm">
                    <topic.icon size={20} className="text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-white mb-1 group-hover:text-violet-200 transition-colors">
                    {topic.name}
                  </h3>
                  <p className="text-xs text-indigo-100/70 leading-relaxed">{topic.description}</p>
                </div>
              </AnimateOnScroll>
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

          <div className="grid sm:grid-cols-3 gap-8 relative">
            {/* Connecting lines between steps (desktop only) */}
            <div className="hidden sm:block absolute top-7 left-[calc(33.33%+1.75rem)] right-[calc(33.33%+1.75rem)] h-px bg-gradient-to-r from-indigo-200 via-violet-200 to-indigo-200" style={{ borderTop: '1px dashed #c7d2fe' }} />

            {steps.map((step, i) => (
              <AnimateOnScroll key={step.number} delay={i * 0.15}>
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-indigo-500 bg-white text-indigo-600 font-black text-lg mb-5 shadow-sm z-10">
                    {step.number}
                    {/* Inner dot */}
                    <span className="absolute inset-0 rounded-full bg-indigo-50 -z-10" />
                  </div>
                  <h3 className="font-bold text-zinc-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{step.description}</p>
                </div>
              </AnimateOnScroll>
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

          <div className="grid sm:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan, i) => (
              <AnimateOnScroll key={plan.name} delay={i * 0.1}>
              <div
                className={`relative rounded-2xl p-8 flex flex-col h-full ${
                  plan.highlighted
                    ? 'pricing-glow border border-indigo-400/60'
                    : 'border border-zinc-100 bg-white'
                }`}
                style={plan.highlighted ? {
                  background: 'linear-gradient(160deg, #faf5ff 0%, #eff6ff 50%, #faf5ff 100%)',
                } : {}}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold rounded-full tracking-wide shadow-md shadow-indigo-500/30">
                    LE PLUS POPULAIRE
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-base font-bold text-zinc-900 mb-0.5">{plan.name}</h3>
                  <p className="text-sm text-zinc-500 mb-5">{plan.description}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-zinc-900 tracking-tight">{plan.price}</span>
                    <span className="text-sm text-zinc-400 font-medium">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-sm text-zinc-600">
                      <span className={`shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center ${plan.highlighted ? 'bg-indigo-100' : 'bg-zinc-100'}`}>
                        <Check size={10} className={plan.highlighted ? 'text-indigo-600' : 'text-zinc-500'} />
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaHref}
                  className={`block w-full py-3.5 text-center rounded-xl font-semibold transition-all text-sm ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="relative overflow-hidden py-24 sm:py-32 cta-mesh">
        {/* Noise overlay */}
        <div className="absolute inset-0 noise-overlay opacity-30" />
        {/* Radial light */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.12),transparent_70%)] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-indigo-200 text-sm font-semibold uppercase tracking-widest mb-4">
            Prêt à démarrer ?
          </p>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-5 leading-tight tracking-tight">
            Reprenez le contrôle de<br className="hidden sm:block" /> votre vie administrative.
          </h2>
          <p className="text-indigo-200 text-lg mb-10 max-w-md mx-auto">
            Un compte gratuit pour démarrer. Sans carte bancaire. Sans engagement.
          </p>
          <Link
            href="/auth/register"
            className="group inline-flex items-center gap-2.5 px-9 py-4 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-2xl shadow-indigo-900/30 hover:-translate-y-0.5"
          >
            Commencer gratuitement
            <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
          </Link>
          <p className="mt-5 text-indigo-300 text-xs tracking-wide">
            Gratuit · Sans carte · Actif en 30 secondes
          </p>
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
