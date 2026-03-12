'use client'

import { useState, useTransition } from 'react'
import {
  User,
  Briefcase,
  Settings,
  Shield,
  Lock,
  Check,
  GraduationCap,
  Search,
  Users,
  LogOut,
  AlertTriangle,
  Calendar,
  Clock,
  FileText,
  Heart,
  DollarSign,
  HandHeart,
  Home,
  Stethoscope,
  Pill,
  TestTube,
  type LucideIcon,
} from 'lucide-react'
import type { ProfilePageData, ProfileType, ProfessionalProfile, PlanName, Subscription } from '@/types'
import { updateDisplayName, updateProfileType, changePassword } from '@/app/actions/profile'
import { updateSelectedTopics } from '@/app/actions/preferences'
import { upsertProfessionalProfile } from '@/app/actions/professional-profile'
import { createPortalSession, createCheckoutSession } from '@/app/actions/subscription'
import { signOut } from '@/app/actions/auth'
import { ALL_TOPIC_SLUGS } from '@/lib/profile-topics'

type Topic = { slug: string; title: string; icon: LucideIcon }
type Category = { name: string; icon: LucideIcon; topics: Topic[] }

const categories: Category[] = [
  {
    name: 'Travail',
    icon: Briefcase,
    topics: [
      { slug: 'fiches-de-paie', title: 'Fiches de paie', icon: DollarSign },
      { slug: 'caf', title: 'CAF / Aides', icon: HandHeart },
    ],
  },
  {
    name: 'Sante',
    icon: Stethoscope,
    topics: [
      { slug: 'mutuelle', title: 'Mutuelle', icon: Heart },
      { slug: 'medecin-generaliste', title: 'Medecin generaliste', icon: Stethoscope },
      { slug: 'pharmacie', title: 'Pharmacie', icon: Pill },
      { slug: 'analyses-medicales', title: 'Analyses medicales', icon: TestTube },
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

const profileTypes: { type: ProfileType; label: string; icon: LucideIcon; description: string }[] = [
  { type: 'etudiant', label: 'Etudiant', icon: GraduationCap, description: 'Universite, ecole, formation' },
  { type: 'salarie', label: 'Salarie', icon: Briefcase, description: 'Emploi en entreprise' },
  { type: 'independant', label: 'Independant', icon: User, description: 'Auto-entrepreneur, freelance' },
  { type: 'recherche_emploi', label: "Recherche d'emploi", icon: Search, description: 'En transition professionnelle' },
  { type: 'autre', label: 'Autre', icon: Users, description: 'Autre situation' },
]

type ProfilePageContentProps = {
  data: ProfilePageData
  professionalProfile?: ProfessionalProfile | null
  planTier?: PlanName
  subscription?: Subscription | null
}

export default function ProfilePageContent({ data, professionalProfile, planTier = 'free', subscription }: ProfilePageContentProps) {
  // Section 1 — Display name
  const [displayName, setDisplayName] = useState(data.displayName || '')
  const [nameMessage, setNameMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isNamePending, startNameTransition] = useTransition()

  // Section 2 — Profile type
  const [currentProfileType, setCurrentProfileType] = useState<ProfileType>(data.profileType)
  const [pendingProfileType, setPendingProfileType] = useState<ProfileType | null>(null)
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isProfilePending, startProfileTransition] = useTransition()

  // Section 3 — Topics
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set(data.selectedTopics))
  const [topicsMessage, setTopicsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isTopicsPending, startTopicsTransition] = useTransition()

  // Section 4 — Password
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPasswordPending, startPasswordTransition] = useTransition()

  // Section 5 — Professional profile
  const [proProfile, setProProfile] = useState({
    business_name: professionalProfile?.business_name || '',
    siret: professionalProfile?.siret || '',
    address_line1: professionalProfile?.address_line1 || '',
    postal_code: professionalProfile?.postal_code || '',
    city: professionalProfile?.city || '',
    tva_number: professionalProfile?.tva_number || '',
    iban: professionalProfile?.iban || '',
    bic: professionalProfile?.bic || '',
    hourly_rate: professionalProfile?.hourly_rate?.toString() || '',
    is_micro_entrepreneur: professionalProfile?.is_micro_entrepreneur || false,
    invoice_prefix: professionalProfile?.invoice_prefix || 'F',
    quotation_prefix: professionalProfile?.quotation_prefix || 'D',
    default_payment_terms_days: professionalProfile?.default_payment_terms_days || 30,
  })
  const [proMessage, setProMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isProPending, startProTransition] = useTransition()

  // Handlers
  const handleSaveName = () => {
    setNameMessage(null)
    startNameTransition(async () => {
      const result = await updateDisplayName(displayName.trim())
      if (result.success) {
        setNameMessage({ type: 'success', text: 'Nom mis a jour avec succes' })
      } else {
        setNameMessage({ type: 'error', text: result.error || 'Erreur lors de la mise a jour' })
      }
    })
  }

  const handleProfileTypeClick = (type: ProfileType) => {
    if (type === currentProfileType) return
    setPendingProfileType(type)
  }

  const confirmProfileChange = (resetTopics: boolean) => {
    if (!pendingProfileType) return
    setProfileMessage(null)
    const newType = pendingProfileType
    startProfileTransition(async () => {
      const result = await updateProfileType(newType, resetTopics)
      if (result.success) {
        setCurrentProfileType(newType)
        setProfileMessage({ type: 'success', text: 'Profil mis a jour avec succes' })
        if (resetTopics) {
          // Refresh the page to get updated topics
          window.location.reload()
        }
      } else {
        setProfileMessage({ type: 'error', text: result.error || 'Erreur lors de la mise a jour' })
      }
      setPendingProfileType(null)
    })
  }

  const toggleTopic = (slug: string) => {
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

  const handleSaveTopics = () => {
    setTopicsMessage(null)
    startTopicsTransition(async () => {
      const result = await updateSelectedTopics([...selectedTopics])
      if (result.success) {
        setTopicsMessage({ type: 'success', text: 'Sujets mis a jour avec succes' })
      } else {
        setTopicsMessage({ type: 'error', text: result.error || 'Erreur lors de la mise a jour' })
      }
    })
  }

  const handleSaveProProfile = () => {
    setProMessage(null)
    startProTransition(async () => {
      const result = await upsertProfessionalProfile({
        business_name: proProfile.business_name.trim() || null,
        siret: proProfile.siret.trim() || null,
        address_line1: proProfile.address_line1.trim() || null,
        postal_code: proProfile.postal_code.trim() || null,
        city: proProfile.city.trim() || null,
        tva_number: proProfile.tva_number.trim() || null,
        iban: proProfile.iban.trim() || null,
        bic: proProfile.bic.trim() || null,
        hourly_rate: proProfile.hourly_rate ? parseFloat(proProfile.hourly_rate) : null,
        is_micro_entrepreneur: proProfile.is_micro_entrepreneur,
        invoice_prefix: proProfile.invoice_prefix || 'F',
        quotation_prefix: proProfile.quotation_prefix || 'D',
        default_payment_terms_days: proProfile.default_payment_terms_days,
      })
      if (result.error) {
        setProMessage({ type: 'error', text: result.error })
      } else {
        setProMessage({ type: 'success', text: 'Profil professionnel mis a jour avec succes' })
      }
    })
  }

  const handleChangePassword = () => {
    setPasswordMessage(null)
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' })
      return
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caracteres' })
      return
    }
    startPasswordTransition(async () => {
      const result = await changePassword(newPassword)
      if (result.success) {
        setPasswordMessage({ type: 'success', text: 'Mot de passe modifie avec succes' })
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordMessage({ type: 'error', text: result.error || 'Erreur lors du changement de mot de passe' })
      }
    })
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Mon profil
          </h1>
          <p className="text-zinc-700 dark:text-zinc-400">
            Gerez vos informations personnelles et vos preferences
          </p>
        </div>

        <div className="space-y-8">
          {/* Section 1 — Informations personnelles */}
          <section className="glass-card rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md shadow-teal-500/30">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Informations personnelles
              </h2>
            </div>

            <div className="space-y-4">
              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Adresse email
                </label>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/40">
                  <Lock className="w-4 h-4 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{data.email}</span>
                </div>
              </div>

              {/* Display name */}
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Nom d&apos;affichage
                </label>
                <div className="flex gap-3">
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Votre nom"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/40 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isNamePending}
                    className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-medium text-sm hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md shadow-teal-500/30 disabled:opacity-50 flex-shrink-0"
                  >
                    {isNamePending ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
                {nameMessage && (
                  <p className={`mt-2 text-sm ${nameMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {nameMessage.text}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Section 2 — Type de profil */}
          <section className="glass-card rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-md shadow-purple-500/30">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Type de profil
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {profileTypes.map(({ type, label, icon: Icon, description }) => {
                const isActive = type === currentProfileType
                return (
                  <button
                    key={type}
                    onClick={() => handleProfileTypeClick(type)}
                    disabled={isProfilePending}
                    className={`relative flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      isActive
                        ? 'border-blue-400 dark:border-blue-500/60 bg-blue-50/50 dark:bg-blue-500/10 shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-700/40 hover:border-zinc-300 dark:hover:border-zinc-600/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                    } disabled:opacity-50`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-500 dark:text-zinc-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-semibold block ${
                        isActive ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-900 dark:text-zinc-100'
                      }`}>
                        {label}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">{description}</span>
                    </div>
                    {isActive && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {profileMessage && (
              <p className={`mt-4 text-sm ${profileMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {profileMessage.text}
              </p>
            )}

            {/* Confirmation dialog */}
            {pendingProfileType && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-3">
                      Changer votre profil en &quot;{profileTypes.find(p => p.type === pendingProfileType)?.label}&quot; ?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => confirmProfileChange(false)}
                        disabled={isProfilePending}
                        className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                      >
                        {isProfilePending ? 'Changement...' : 'Changer le profil uniquement'}
                      </button>
                      <button
                        onClick={() => confirmProfileChange(true)}
                        disabled={isProfilePending}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-violet-700 transition-all shadow-md shadow-purple-500/30 disabled:opacity-50"
                      >
                        {isProfilePending ? 'Changement...' : 'Changer et reinitialiser les sujets'}
                      </button>
                      <button
                        onClick={() => setPendingProfileType(null)}
                        disabled={isProfilePending}
                        className="px-4 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Section 3 — Gestion des sujets */}
          <section className="glass-card rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/30">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Gestion des sujets
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {selectedTopics.size} sujet{selectedTopics.size > 1 ? 's' : ''} selectionne{selectedTopics.size > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedTopics(new Set(ALL_TOPIC_SLUGS))}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Tout selectionner
                </button>
                <span className="text-zinc-300 dark:text-zinc-600">|</span>
                <button
                  onClick={() => setSelectedTopics(new Set(data.selectedTopics))}
                  className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  Reinitialiser
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {categories.map((category) => {
                const CategoryIcon = category.icon
                return (
                  <div key={category.name}>
                    <div className="flex items-center gap-2 mb-3">
                      <CategoryIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        {category.name}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {category.topics.map((topic) => {
                        const TopicIcon = topic.icon
                        const isSelected = selectedTopics.has(topic.slug)
                        return (
                          <button
                            key={topic.slug}
                            onClick={() => toggleTopic(topic.slug)}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                              isSelected
                                ? 'border-blue-300 dark:border-blue-500/40 bg-blue-50/50 dark:bg-blue-500/10'
                                : 'border-zinc-200 dark:border-zinc-700/40 opacity-50 hover:opacity-80 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                            }`}
                          >
                            <TopicIcon className={`w-4 h-4 flex-shrink-0 ${
                              isSelected
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-zinc-400 dark:text-zinc-500'
                            }`} />
                            <span className={`text-sm font-medium flex-1 text-left ${
                              isSelected
                                ? 'text-zinc-900 dark:text-zinc-100'
                                : 'text-zinc-500 dark:text-zinc-400'
                            }`}>
                              {topic.title}
                            </span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 flex items-center justify-end">
              <button
                onClick={handleSaveTopics}
                disabled={isTopicsPending || selectedTopics.size === 0}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/30 disabled:opacity-50"
              >
                {isTopicsPending ? 'Enregistrement...' : 'Enregistrer les sujets'}
              </button>
            </div>

            {topicsMessage && (
              <p className={`mt-3 text-sm ${topicsMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {topicsMessage.text}
              </p>
            )}
          </section>

          {/* Section — Abonnement */}
          <section className="glass-card rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md shadow-green-500/30">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Mon abonnement
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-500/10">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Plan actuel :{' '}
                      <span className="text-green-700 dark:text-green-300 font-semibold capitalize">
                        {planTier === 'free' ? 'Gratuit' : planTier === 'essentiel' ? 'Essentiel' : 'Pro'}
                      </span>
                    </p>
                    {subscription?.current_period_end && planTier !== 'free' && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                        {subscription.cancel_at_period_end
                          ? `Se termine le ${new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}`
                          : `Prochain renouvellement le ${new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}`}
                      </p>
                    )}
                    {subscription?.cancel_at_period_end && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                        Annulation programmee
                      </p>
                    )}
                  </div>
                  {planTier !== 'free' && (
                    <button
                      onClick={() => createPortalSession()}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all"
                    >
                      Gerer mon abonnement
                    </button>
                  )}
                </div>
              </div>

              {planTier === 'free' && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => createCheckoutSession('essentiel')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium text-sm hover:from-indigo-700 hover:to-blue-700 transition-all"
                  >
                    Passer a Essentiel — 4,99€/mois
                  </button>
                  <button
                    onClick={() => createCheckoutSession('pro')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:from-purple-700 hover:to-indigo-700 transition-all"
                  >
                    Passer a Pro — 9,99€/mois
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Section 5 — Profil professionnel */}
          <section className="glass-card rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Profil professionnel
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Informations affichees sur vos factures et devis
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Nom commercial
                  </label>
                  <input
                    type="text"
                    value={proProfile.business_name}
                    onChange={(e) => setProProfile({ ...proProfile, business_name: e.target.value })}
                    placeholder="Votre nom ou raison sociale"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/40 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    SIRET
                  </label>
                  <input
                    type="text"
                    value={proProfile.siret}
                    onChange={(e) => setProProfile({ ...proProfile, siret: e.target.value })}
                    placeholder="123 456 789 00012"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/40 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Adresse
                </label>
                <input
                  type="text"
                  value={proProfile.address_line1}
                  onChange={(e) => setProProfile({ ...proProfile, address_line1: e.target.value })}
                  placeholder="Numero et rue"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/40 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={proProfile.postal_code}
                    onChange={(e) => setProProfile({ ...proProfile, postal_code: e.target.value })}
                    placeholder="75001"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/40 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={proProfile.city}
                    onChange={(e) => setProProfile({ ...proProfile, city: e.target.value })}
                    placeholder="Paris"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/40 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Numero de TVA
                  </label>
                  <input
                    type="text"
                    value={proProfile.tva_number}
                    onChange={(e) => setProProfile({ ...proProfile, tva_number: e.target.value })}
                    placeholder="FR 12 345678901"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/40 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Taux horaire (€)
                  </label>
                  <input
                    type="number"
                    value={proProfile.hourly_rate}
                    onChange={(e) => setProProfile({ ...proProfile, hourly_rate: e.target.value })}
                    placeholder="50"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/40 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    IBAN
                  </label>
                  <input
                    type="text"
                    value={proProfile.iban}
                    onChange={(e) => setProProfile({ ...proProfile, iban: e.target.value })}
                    placeholder="FR76 1234 5678 9012 3456 7890 123"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/40 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    BIC
                  </label>
                  <input
                    type="text"
                    value={proProfile.bic}
                    onChange={(e) => setProProfile({ ...proProfile, bic: e.target.value })}
                    placeholder="BNPAFRPP"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/40 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  />
                </div>
              </div>

              {/* Micro-entrepreneur toggle */}
              <div className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700/40">
                <button
                  type="button"
                  onClick={() => setProProfile({ ...proProfile, is_micro_entrepreneur: !proProfile.is_micro_entrepreneur })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    proProfile.is_micro_entrepreneur ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-600'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    proProfile.is_micro_entrepreneur ? 'translate-x-5' : ''
                  }`} />
                </button>
                <div>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Micro-entrepreneur</span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">TVA non applicable, art. 293 B du CGI</p>
                </div>
              </div>

              {/* Prefixes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Prefixe facture
                  </label>
                  <input
                    type="text"
                    value={proProfile.invoice_prefix}
                    onChange={(e) => setProProfile({ ...proProfile, invoice_prefix: e.target.value })}
                    placeholder="F"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/40 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Prefixe devis
                  </label>
                  <input
                    type="text"
                    value={proProfile.quotation_prefix}
                    onChange={(e) => setProProfile({ ...proProfile, quotation_prefix: e.target.value })}
                    placeholder="D"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/40 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Delai paiement (j)
                  </label>
                  <input
                    type="number"
                    value={proProfile.default_payment_terms_days}
                    onChange={(e) => setProProfile({ ...proProfile, default_payment_terms_days: parseInt(e.target.value) || 30 })}
                    min="0"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/40 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleSaveProProfile}
                  disabled={isProPending}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/30 disabled:opacity-50"
                >
                  {isProPending ? 'Enregistrement...' : 'Enregistrer le profil professionnel'}
                </button>
              </div>

              {proMessage && (
                <p className={`text-sm ${proMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {proMessage.text}
                </p>
              )}
            </div>
          </section>

          {/* Section 4 — Securite et compte */}
          <section className="glass-card rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md shadow-orange-500/30">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Securite et compte
              </h2>
            </div>

            <div className="space-y-6">
              {/* Password change */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                  Changer le mot de passe
                </h3>
                <div className="space-y-3 max-w-md">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Nouveau mot de passe
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 caracteres"
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/40 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Confirmer le mot de passe
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Retapez le mot de passe"
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/40 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                    />
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={isPasswordPending || !newPassword || !confirmPassword}
                    className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-medium text-sm hover:from-orange-700 hover:to-red-700 transition-all shadow-md shadow-orange-500/30 disabled:opacity-50"
                  >
                    {isPasswordPending ? 'Modification...' : 'Modifier le mot de passe'}
                  </button>
                  {passwordMessage && (
                    <p className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {passwordMessage.text}
                    </p>
                  )}
                </div>
              </div>

              {/* Separator */}
              <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-700/60 to-transparent" />

              {/* Account info */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                  Informations du compte
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>Inscrit le {new Date(data.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  {data.lastSignInAt && (
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>Derniere connexion le {new Date(data.lastSignInAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Separator */}
              <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-700/60 to-transparent" />

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <form action={signOut}>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 border border-zinc-200 dark:border-zinc-700/40 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Se deconnecter
                  </button>
                </form>
                <div className="relative group">
                  <button
                    disabled
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/40 cursor-not-allowed opacity-60"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Supprimer mon compte
                  </button>
                  <div className="absolute bottom-full left-0 mb-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Contactez le support pour supprimer votre compte
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
