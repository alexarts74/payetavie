'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { translateAuthError } from '@/lib/auth-errors'
import { completeOnboarding, skipOnboarding } from '@/app/actions/preferences'
import { getTopicsForProfile } from '@/lib/profile-topics'
import Link from 'next/link'
import {
  Mail, Lock, ArrowRight, ArrowLeft, CheckCircle2, Check,
  GraduationCap, Briefcase, Rocket, Search, MapPin,
  FileText, DollarSign, HandHeart, Shield, Heart,
  Stethoscope, Pill, TestTube, Home, Users,
  ClipboardCheck, FolderOpen, Bell, Sparkles,
  type LucideIcon,
} from 'lucide-react'
import type { ProfileType, HousingSituation } from '@/types'

/* ============================================
   Data
   ============================================ */

type TopicEntry = { slug: string; title: string; icon: LucideIcon }
type CategoryEntry = { name: string; icon: LucideIcon; topics: TopicEntry[] }

const profiles: {
  type: ProfileType
  label: string
  description: string
  icon: typeof GraduationCap
  topicCount: number
}[] = [
  {
    type: 'etudiant',
    label: 'Étudiant(e)',
    description: 'CAF, mutuelle, médecin, pharmacie',
    icon: GraduationCap,
    topicCount: 6,
  },
  {
    type: 'salarie',
    label: 'Salarié(e)',
    description: 'Fiches de paie, mutuelle, médecin, assurances',
    icon: Briefcase,
    topicCount: 7,
  },
  {
    type: 'independant',
    label: 'Indépendant(e) / Auto-entrepreneur',
    description: 'URSSAF, impôts, assurances, clients, facturation',
    icon: Rocket,
    topicCount: 9,
  },
  {
    type: 'recherche_emploi',
    label: 'En recherche d\'emploi',
    description: 'CAF, mutuelle, médecin, pharmacie',
    icon: Search,
    topicCount: 6,
  },
  {
    type: 'autre',
    label: 'Autre',
    description: 'Les essentiels : mutuelle, médecin, pharmacie, assurances',
    icon: MapPin,
    topicCount: 5,
  },
]

const categories: CategoryEntry[] = [
  {
    name: 'Travail',
    icon: Briefcase,
    topics: [
      { slug: 'fiches-de-paie', title: 'Fiches de paie', icon: DollarSign },
      { slug: 'caf', title: 'CAF / Aides', icon: HandHeart },
    ],
  },
  {
    name: 'Santé',
    icon: Stethoscope,
    topics: [
      { slug: 'mutuelle', title: 'Mutuelle', icon: Heart },
      { slug: 'medecin-generaliste', title: 'Médecin généraliste', icon: Stethoscope },
      { slug: 'pharmacie', title: 'Pharmacie', icon: Pill },
      { slug: 'analyses-medicales', title: 'Analyses médicales', icon: TestTube },
    ],
  },
  {
    name: 'Logement',
    icon: Home,
    topics: [
      { slug: 'logement', title: 'Logement', icon: Home },
    ],
  },
]

const stepLabels = ['Bienvenue', 'Compte', 'Profil', 'Sujets', 'Récapitulatif']

const featureCards = [
  {
    icon: ClipboardCheck,
    title: 'Guides & checklists',
    description: 'Des guides pas-à-pas et des checklists pour chaque démarche administrative.',
  },
  {
    icon: FolderOpen,
    title: 'Stockage documents',
    description: 'Centralisez vos documents importants en un seul endroit, accessible partout.',
  },
  {
    icon: Bell,
    title: 'Rappels & calendrier',
    description: 'Ne manquez plus jamais une échéance grâce aux rappels personnalisés.',
  },
]

const housingSituations: { value: HousingSituation; label: string }[] = [
  { value: 'locataire', label: 'Locataire' },
  { value: 'proprietaire', label: 'Propriétaire' },
  { value: 'parents', label: 'Chez les parents' },
  { value: 'residence_etudiante', label: 'Résidence étudiante' },
  { value: 'heberge', label: 'Hébergé(e)' },
]

/* ============================================
   Sub-components
   ============================================ */

function StepProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full px-4 py-3 sm:py-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Progress line background */}
          <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-zinc-200 dark:bg-zinc-700" />
          {/* Progress line fill */}
          <div
            className="absolute top-5 left-[10%] h-0.5 bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-500"
            style={{ width: `${(currentStep / (stepLabels.length - 1)) * 80}%` }}
          />

          {stepLabels.map((label, i) => {
            const isActive = i === currentStep
            const isPast = i < currentStep
            return (
              <div key={label} className="relative z-10 flex flex-col items-center gap-1.5">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/35 scale-110'
                      : isPast
                        ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {isPast ? <Check className="w-5 h-5" /> : i}
                </div>
                <span
                  className={`text-[11px] font-medium transition-colors hidden sm:block ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : isPast
                        ? 'text-zinc-600 dark:text-zinc-400'
                        : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center animate-slide-left">
      {/* Left: content */}
      <div className="flex-1 max-w-xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/35 mb-6">
          <span className="text-2xl font-bold text-white">PTV</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-3">
          Bienvenue sur{' '}
          <span className="gradient-text">PayeTaVie</span>
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          Simplifiez votre vie administrative en quelques minutes.
          On s&apos;occupe de tout organiser pour vous.
        </p>

        <div className="space-y-4 mb-8">
          {featureCards.map((card, i) => {
            const Icon = card.icon
            return (
              <div
                key={card.title}
                className={`glass-card rounded-2xl p-5 flex items-start gap-4 animate-slide-up stagger-${i + 1}`}
                style={{ opacity: 0 }}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-500/20">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{card.title}</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{card.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={onNext}
          className="group flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-150"
        >
          Commencer
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Right: decoration */}
      <div className="hidden lg:flex flex-1 items-center justify-center">
        <div className="relative w-72 h-72">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 dark:from-blue-400/10 dark:to-indigo-400/10 rounded-full blur-3xl" />
          <div className="relative glass-card rounded-3xl p-8 text-center">
            <Sparkles className="w-16 h-16 text-blue-500 dark:text-blue-400 mx-auto mb-4" />
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Tout au même endroit</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Impôts, mutuelle, logement, transport... Gérez toute votre admin depuis un seul espace.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function AccountStep({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  error,
  loading,
  onSubmit,
  onBack,
}: {
  email: string
  setEmail: (v: string) => void
  password: string
  setPassword: (v: string) => void
  confirmPassword: string
  setConfirmPassword: (v: string) => void
  error: string | null
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
}) {
  const passwordStrength = password.length >= 6 ? 'good' : password.length > 0 ? 'weak' : 'none'
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start animate-slide-left">
      {/* Left: form */}
      <div className="flex-1 w-full max-w-lg">
        <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Créer votre compte
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          Rejoignez PayeTaVie et simplifiez votre vie administrative
        </p>

        <div className="glass-card-heavy rounded-3xl p-6 sm:p-8">
          <form className="space-y-4" onSubmit={onSubmit}>
            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 p-3 animate-scale-in">
                <p className="text-sm text-red-800 dark:text-red-300 font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {error}
                </p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all duration-200 text-sm"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all duration-200 text-sm"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex items-center gap-2 text-xs">
                {passwordStrength === 'good' ? (
                  <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Valide
                  </span>
                ) : passwordStrength === 'weak' ? (
                  <span className="text-amber-600 dark:text-amber-400">Min. 6 caractères</span>
                ) : (
                  <span className="text-zinc-500">Min. 6 caractères</span>
                )}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`block w-full pl-10 pr-9 py-2.5 rounded-xl glass-input text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all duration-200 text-sm ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? 'border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-600'
                        : 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-600'
                      : ''
                  }`}
                  placeholder="••••••••"
                />
                {confirmPassword.length > 0 && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {passwordsMatch ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border-2 border-red-300 dark:border-red-600" />
                    )}
                  </div>
                )}
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-600 dark:text-red-400">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !passwordsMatch || password.length < 6}
              className="w-full group relative flex items-center justify-center gap-2 py-3 px-6 rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 hover:shadow-md hover:shadow-indigo-500/25"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Création...</span>
                </>
              ) : (
                <>
                  <span>Créer mon compte</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Login link */}
            <div className="text-center pt-1">
              <p className="text-xs text-zinc-700 dark:text-zinc-400">
                Déjà un compte ?{' '}
                <Link
                  href="/auth/login"
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors inline-flex items-center gap-1 group"
                >
                  Se connecter
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          Retour
        </button>
      </div>

      {/* Right: decoration */}
      <div className="hidden lg:flex flex-1 items-center justify-center lg:mt-14">
        <div className="glass-card rounded-3xl p-8 max-w-xs text-center">
          <Lock className="w-12 h-12 text-blue-500 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Vos données sont sécurisées
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Chiffrement de bout en bout et authentification sécurisée via Supabase.
          </p>
        </div>
      </div>
    </div>
  )
}

function ProfileStep({
  selectedProfile,
  onSelectProfile,
  selectedTopics,
  birthDate,
  setBirthDate,
  postalCode,
  setPostalCode,
  housingSituation,
  setHousingSituation,
  error,
  loading,
  onNext,
  onBack,
  onSkip,
  isReturningUser,
}: {
  selectedProfile: ProfileType | null
  onSelectProfile: (p: ProfileType) => void
  selectedTopics: Set<string>
  birthDate: string
  setBirthDate: (v: string) => void
  postalCode: string
  setPostalCode: (v: string) => void
  housingSituation: HousingSituation | null
  setHousingSituation: (v: HousingSituation | null) => void
  error: string | null
  loading: boolean
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  isReturningUser?: boolean
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start animate-slide-left">
      {/* Left: profile selection */}
      <div className="flex-1 w-full max-w-lg">
        <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Quelle est votre situation ?
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          On adapte vos sujets selon votre profil
        </p>

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 p-3 mb-4 animate-scale-in">
            <p className="text-sm text-red-800 dark:text-red-300 font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </p>
          </div>
        )}

        <div className="space-y-2 mb-6">
          {profiles.map(({ type, label, description, icon: Icon }) => (
            <button
              key={type}
              onClick={() => onSelectProfile(type)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                selectedProfile === type
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 shadow-md shadow-blue-500/10'
                  : 'border-zinc-200 dark:border-zinc-700/60 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                selectedProfile === type
                  ? 'bg-blue-500/20 dark:bg-blue-500/30'
                  : 'bg-zinc-100 dark:bg-zinc-800'
              }`}>
                <Icon className={`w-4 h-4 transition-colors ${
                  selectedProfile === type
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-semibold transition-colors block ${
                  selectedProfile === type
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-zinc-700 dark:text-zinc-300'
                }`}>
                  {label}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                  {description}
                </span>
              </div>
              {selectedProfile === type && (
                <CheckCircle2 className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Optional personal info — mobile only */}
        {selectedProfile && (
          <div className="glass-card rounded-2xl p-5 mb-6 animate-scale-in lg:hidden">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Infos pour personnaliser
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
                Optionnel
              </span>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="birthDateMobile" className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Date de naissance
                  </label>
                  <input
                    id="birthDateMobile"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="block w-full px-3 py-2 rounded-xl glass-input text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all duration-200 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="postalCodeMobile" className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Code postal
                  </label>
                  <input
                    id="postalCodeMobile"
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    value={postalCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 5)
                      setPostalCode(val)
                    }}
                    className="block w-full px-3 py-2 rounded-xl glass-input text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all duration-200 text-sm"
                    placeholder="75001"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Logement
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {housingSituations.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setHousingSituation(housingSituation === value ? null : value)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all duration-200 ${
                        housingSituation === value
                          ? 'border-blue-400 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium'
                          : 'border-zinc-200 dark:border-zinc-700/40 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          {!isReturningUser ? (
            <button
              onClick={onBack}
              disabled={loading}
              className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              Retour
            </button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-3">
            {!isReturningUser && (
              <button
                onClick={onSkip}
                disabled={loading}
                className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors disabled:opacity-50"
              >
                Passer
              </button>
            )}
            <button
              onClick={onNext}
              disabled={!selectedProfile || loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuer
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right panel — desktop */}
      <div className="hidden lg:block flex-1 max-w-sm lg:mt-14">
        <div className="sticky top-8 space-y-5">
          {/* Optional personal info */}
          {selectedProfile && (
            <div className="glass-card rounded-3xl p-6 animate-scale-in">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Infos pour personnaliser
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
                  Optionnel
                </span>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="birthDate" className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Date de naissance
                  </label>
                  <input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="block w-full px-3 py-2 rounded-xl glass-input text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all duration-200 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="postalCode" className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Code postal
                  </label>
                  <input
                    id="postalCode"
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    value={postalCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 5)
                      setPostalCode(val)
                    }}
                    className="block w-full px-3 py-2 rounded-xl glass-input text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all duration-200 text-sm"
                    placeholder="75001"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Logement
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {housingSituations.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setHousingSituation(housingSituation === value ? null : value)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all duration-200 ${
                          housingSituation === value
                            ? 'border-blue-400 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium'
                            : 'border-zinc-200 dark:border-zinc-700/40 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Topic preview */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-500" />
              Aperçu de vos sujets
            </h3>
            {selectedProfile ? (
              <div className="space-y-2">
                {categories.map((cat) => {
                  const matchingTopics = cat.topics.filter(t => selectedTopics.has(t.slug))
                  if (matchingTopics.length === 0) return null
                  const CatIcon = cat.icon
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <CatIcon className="w-3 h-3 text-zinc-400" />
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">{cat.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {matchingTopics.map(t => (
                          <span
                            key={t.slug}
                            className="text-[11px] px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/50"
                          >
                            {t.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 pt-2 border-t border-zinc-200/50 dark:border-zinc-700/40">
                  {selectedTopics.size} sujet{selectedTopics.size > 1 ? 's' : ''} sélectionné{selectedTopics.size > 1 ? 's' : ''}
                </p>
              </div>
            ) : (
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Sélectionnez un profil pour voir les sujets inclus
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TopicsStep({
  selectedTopics,
  baseTopics,
  onToggleTopic,
  error,
  loading,
  onNext,
  onBack,
}: {
  selectedTopics: Set<string>
  baseTopics: Set<string>
  onToggleTopic: (slug: string) => void
  error: string | null
  loading: boolean
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div className="w-full max-w-4xl mx-auto animate-slide-left">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            Personnalisez vos sujets
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Les sujets de votre profil sont pré-sélectionnés. Ajoutez-en d&apos;autres si besoin.
          </p>
        </div>
        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-full flex-shrink-0">
          {selectedTopics.size} sujet{selectedTopics.size > 1 ? 's' : ''}
        </span>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 p-3 mb-3 animate-scale-in">
          <p className="text-sm text-red-800 dark:text-red-300 font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {error}
          </p>
        </div>
      )}

      <div className="mb-4 space-y-2.5">
        {categories.map((category) => {
          const CategoryIcon = category.icon
          return (
            <div key={category.name}>
              <div className="flex items-center gap-1.5 mb-1">
                <CategoryIcon className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  {category.name}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {category.topics.map((topic) => {
                  const TopicIcon = topic.icon
                  const isSelected = selectedTopics.has(topic.slug)
                  const isBase = baseTopics.has(topic.slug)
                  return (
                    <button
                      key={topic.slug}
                      onClick={() => {
                        if (!isBase) onToggleTopic(topic.slug)
                      }}
                      disabled={isBase}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all duration-200 ${
                        isSelected
                          ? 'border-indigo-300 dark:border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-500/10'
                          : 'border-zinc-200 dark:border-zinc-700/40 opacity-50 hover:opacity-80 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                      } ${isBase ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <TopicIcon className={`w-3.5 h-3.5 flex-shrink-0 ${
                        isSelected
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-zinc-400 dark:text-zinc-500'
                      }`} />
                      <span className={`text-xs font-medium flex-1 text-left truncate ${
                        isSelected
                          ? 'text-zinc-900 dark:text-zinc-100'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}>
                        {topic.title}
                      </span>
                      {isBase ? (
                        <span className="text-[10px] px-1 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-indigo-600 dark:text-indigo-400 font-medium flex-shrink-0">
                          Inclus
                        </span>
                      ) : isSelected ? (
                        <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          disabled={loading}
          className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          Retour
        </button>
        <button
          onClick={onNext}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/30 disabled:opacity-50"
        >
          Continuer
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function SummaryStep({
  selectedProfile,
  selectedTopics,
  birthDate,
  postalCode,
  housingSituation,
  error,
  loading,
  onFinish,
  onBack,
}: {
  selectedProfile: ProfileType | null
  selectedTopics: Set<string>
  birthDate: string
  postalCode: string
  housingSituation: HousingSituation | null
  error: string | null
  loading: boolean
  onFinish: () => void
  onBack: () => void
}) {
  const profileInfo = profiles.find(p => p.type === selectedProfile)
  const housingLabel = housingSituation
    ? housingSituations.find(h => h.value === housingSituation)?.label
    : null
  const hasPersonalInfo = birthDate || postalCode || housingSituation

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start animate-slide-left">
      {/* Left: summary */}
      <div className="flex-1 w-full max-w-lg">
        <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Tout est prêt !
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          Voici un récapitulatif de votre configuration
        </p>

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 p-3 mb-4 animate-scale-in">
            <p className="text-sm text-red-800 dark:text-red-300 font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </p>
          </div>
        )}

        {/* Profile card */}
        {profileInfo && (
          <div className="glass-card rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                <profileInfo.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Profil</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{profileInfo.label}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{profileInfo.description}</p>
          </div>
        )}

        {/* Personal info summary */}
        {hasPersonalInfo && (
          <div className="glass-card rounded-2xl p-5 mb-4">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              Infos personnelles
            </p>
            <div className="space-y-2">
              {birthDate && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Date de naissance</span>
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {new Date(birthDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              )}
              {postalCode && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Code postal</span>
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{postalCode}</span>
                </div>
              )}
              {housingLabel && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">Logement</span>
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{housingLabel}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Topics summary */}
        <div className="glass-card rounded-2xl p-5 mb-6">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            {selectedTopics.size} sujet{selectedTopics.size > 1 ? 's' : ''} sélectionné{selectedTopics.size > 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {categories.flatMap(cat =>
              cat.topics.filter(t => selectedTopics.has(t.slug)).map(t => (
                <span
                  key={t.slug}
                  className="text-[11px] px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/50"
                >
                  {t.title}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            disabled={loading}
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Retour
          </button>
          <button
            onClick={onFinish}
            disabled={loading}
            className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Finalisation...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Lancer mon espace</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right: feature preview */}
      <div className="hidden lg:block flex-1 max-w-sm lg:mt-14">
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Ce qui vous attend
          </h3>
          <div className="space-y-4">
            {featureCards.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.title} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-500/20">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{card.title}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{card.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================
   Main Page
   ============================================ */

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<ProfileType | null>(null)
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set())
  const [baseTopics, setBaseTopics] = useState<Set<string>>(new Set())
  const [birthDate, setBirthDate] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [housingSituation, setHousingSituation] = useState<HousingSituation | null>(null)
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false)
  const [isReturningUser, setIsReturningUser] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Detect if user is already authenticated (redirected back for incomplete onboarding)
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsReturningUser(true)
        setStep(2)
      }
      setCheckingAuth(false)
    }
    checkAuth()
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs')
      return
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Format d\'email invalide')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    if (error) {
      setError(translateAuthError(error.message))
      setLoading(false)
    } else if (data.user && !data.session) {
      setEmailConfirmationRequired(true)
      setLoading(false)
    } else {
      setStep(2)
      setLoading(false)
    }
  }

  const handleSelectProfile = (profile: ProfileType) => {
    setSelectedProfile(profile)
    const topics = getTopicsForProfile(profile)
    const topicSet = new Set(topics)
    setBaseTopics(topicSet)
    // Keep any extra topics that were manually added, plus base
    setSelectedTopics(prev => {
      const next = new Set(topicSet)
      // Preserve any manually added topics that are not base
      prev.forEach(slug => {
        if (!baseTopics.has(slug)) {
          next.add(slug)
        }
      })
      return next
    })
  }

  const handleToggleTopic = (slug: string) => {
    setSelectedTopics(prev => {
      const next = new Set(prev)
      if (next.has(slug)) {
        next.delete(slug)
      } else {
        next.add(slug)
      }
      return next
    })
  }

  const handleFinish = async () => {
    if (!selectedProfile) return
    setLoading(true)
    setError(null)

    // Additional topics = selected - base
    const additionalTopics = [...selectedTopics].filter(s => !baseTopics.has(s))
    const result = await completeOnboarding(selectedProfile, additionalTopics, {
      birthDate: birthDate || null,
      postalCode: postalCode || null,
      housingSituation,
    })
    if (!result.success) {
      setError(result.error || 'Erreur lors de la finalisation')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  const handleSkip = async () => {
    setLoading(true)
    setError(null)
    const result = await skipOnboarding()
    if (!result.success) {
      setError(result.error || 'Erreur lors de la finalisation')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-indigo-50/40 to-violet-50/30" />
      <div className="absolute inset-0 app-bg opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-indigo-300/15 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-300/12 rounded-full blur-3xl -ml-48 -mb-48 pointer-events-none" />

      {/* Email confirmation overlay */}
      {emailConfirmationRequired && (
        <div className="flex-1 flex items-center justify-center px-4 relative z-10">
          <div className="w-full max-w-md animate-fade-in">
            <div className="text-center mb-6">
              <Link href="/" className="inline-block mb-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/40 mb-2 hover:scale-105 transition-transform">
                  <span className="text-2xl font-bold text-white">PTV</span>
                </div>
              </Link>
              <h1 className="text-3xl font-bold mb-2">
                <span className="gradient-text">PayeTaVie</span>
              </h1>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                Vérifiez votre email
              </h2>
              <p className="text-sm text-zinc-700 dark:text-zinc-400">
                Un lien de confirmation a été envoyé
              </p>
            </div>

            <div className="glass-card-heavy rounded-3xl p-6 sm:p-8 animate-scale-in text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                <Mail className="w-8 h-8 text-indigo-600" />
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">
                Nous avons envoyé un email de confirmation à
              </p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                {email}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
                Cliquez sur le lien dans l&apos;email pour activer votre compte, puis connectez-vous.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium text-sm hover:from-indigo-500 hover:to-violet-500 transition-all shadow-md shadow-indigo-500/30"
              >
                Aller à la connexion
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Normal flow */}
      {!emailConfirmationRequired && (
        <>
          {/* Step progress */}
          <div className="relative z-10">
            <StepProgress currentStep={step} />
          </div>

          {/* Step content */}
          <div className="flex-1 flex items-center justify-center px-4 sm:px-8 pb-4 relative z-10 overflow-hidden">
            <div className="w-full max-w-5xl">
              {step === 0 && (
                <WelcomeStep onNext={() => { setError(null); setStep(1) }} />
              )}

              {step === 1 && (
                <AccountStep
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  error={error}
                  loading={loading}
                  onSubmit={handleRegister}
                  onBack={() => { setError(null); setStep(0) }}
                />
              )}

              {step === 2 && (
                <ProfileStep
                  selectedProfile={selectedProfile}
                  onSelectProfile={handleSelectProfile}
                  selectedTopics={selectedTopics}
                  birthDate={birthDate}
                  setBirthDate={setBirthDate}
                  postalCode={postalCode}
                  setPostalCode={setPostalCode}
                  housingSituation={housingSituation}
                  setHousingSituation={setHousingSituation}
                  error={error}
                  loading={loading}
                  onNext={() => { setError(null); setStep(3) }}
                  onBack={() => { setError(null); setStep(1) }}
                  onSkip={handleSkip}
                  isReturningUser={isReturningUser}
                />
              )}

              {step === 3 && (
                <TopicsStep
                  selectedTopics={selectedTopics}
                  baseTopics={baseTopics}
                  onToggleTopic={handleToggleTopic}
                  error={error}
                  loading={loading}
                  onNext={() => { setError(null); setStep(4) }}
                  onBack={() => { setError(null); setStep(2) }}
                />
              )}

              {step === 4 && (
                <SummaryStep
                  selectedProfile={selectedProfile}
                  selectedTopics={selectedTopics}
                  birthDate={birthDate}
                  postalCode={postalCode}
                  housingSituation={housingSituation}
                  error={error}
                  loading={loading}
                  onFinish={handleFinish}
                  onBack={() => { setError(null); setStep(3) }}
                />
              )}
            </div>
          </div>

          {/* Back to home link */}
          {step === 0 && (
            <div className="text-center pb-6 relative z-10">
              <Link
                href="/"
                className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Retour à l&apos;accueil
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
