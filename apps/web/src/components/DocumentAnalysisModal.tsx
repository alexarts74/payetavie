'use client'

import { useState } from 'react'
import { X, Sparkles, Loader2, AlertTriangle, ChevronRight } from 'lucide-react'
import type { PlanName } from '@/types'
import UpgradePrompt from '@/components/UpgradePrompt'

const QUOTA_LIMIT = 10

interface DocumentAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  documentId: string
  documentName: string
  plan?: PlanName
}

function parseAnalysis(text: string): { type: string; content: string }[] {
  const sections: { type: string; content: string }[] = []
  const lines = text.split('\n')
  let current: { type: string; content: string } | null = null

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (current) sections.push(current)
      current = { type: line.replace('## ', '').trim(), content: '' }
    } else if (current) {
      current.content += (current.content ? '\n' : '') + line
    }
  }
  if (current) sections.push(current)
  return sections.map(s => ({ ...s, content: s.content.trim() })).filter(s => s.content)
}

export default function DocumentAnalysisModal({ isOpen, onClose, documentId, documentName, plan }: DocumentAnalysisModalProps) {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  const [quotaUsed, setQuotaUsed] = useState<number | null>(null)

  if (!isOpen) return null

  const isPro = plan === 'pro'
  const quotaRemaining = quotaUsed !== null ? QUOTA_LIMIT - quotaUsed : null

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)
    setStarted(true)
    try {
      const res = await fetch('/api/documents/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'analyse")
        if (data.quotaUsed !== undefined) setQuotaUsed(data.quotaUsed)
      } else {
        setAnalysis(data.analysis)
        setQuotaUsed(data.quotaUsed)
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setAnalysis(null)
    setError(null)
    setStarted(false)
    setQuotaUsed(null)
    onClose()
  }

  const sections = analysis ? parseAnalysis(analysis) : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 animate-fade-in">
      <div className="bg-white rounded-[2rem] w-full max-w-lg mx-4 animate-scale-in shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E8E8E8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EEF7F1] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#235037]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#1a2e22]">Analyse IA</h3>
              <p className="text-xs text-[#5A6B61] truncate max-w-[220px]">{documentName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {quotaRemaining !== null && (
              <span className="text-[11px] font-medium text-[#5A6B61] bg-[#F5F5F5] rounded-full px-2.5 py-1">
                {quotaRemaining} analyse{quotaRemaining !== 1 ? 's' : ''} restante{quotaRemaining !== 1 ? 's' : ''}
              </span>
            )}
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-[#EEF7F1] text-[#5A6B61] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isPro ? (
            <UpgradePrompt requiredPlan="pro" />
          ) : !started ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-[#EEF7F1] flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-[#235037]" />
              </div>
              <h4 className="text-sm font-semibold text-[#1a2e22] mb-2">Analyser ce document avec l'IA</h4>
              <p className="text-xs text-[#5A6B61] mb-1 leading-relaxed">
                L'IA va lire votre document et vous fournir une synthèse : type, points clés, alertes et actions recommandées.
              </p>
              <p className="text-xs text-[#5A6B61]/70 mb-6">
                Quota : {QUOTA_LIMIT} analyses offertes par mois sur le plan Pro.
              </p>
              <button
                onClick={handleAnalyze}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#235037] hover:bg-[#1a3d2a] text-white text-sm font-medium transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Lancer l'analyse
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-10">
              <Loader2 className="w-10 h-10 text-[#235037] animate-spin mx-auto mb-4" />
              <p className="text-sm text-[#5A6B61]">Analyse en cours…</p>
              <p className="text-xs text-[#5A6B61]/60 mt-1">Cela peut prendre quelques secondes.</p>
            </div>
          ) : error ? (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">Erreur</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
                {!error.includes('Quota') && (
                  <button
                    onClick={handleAnalyze}
                    className="text-xs font-medium text-red-700 hover:text-red-800 mt-2 flex items-center gap-1"
                  >
                    Réessayer <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {sections.map((section, i) => (
                <div key={i}>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-[#235037] mb-2">{section.type}</h4>
                  <div className="text-sm text-[#5A6B61] leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </div>
                </div>
              ))}
              {sections.length === 0 && (
                <p className="text-sm text-[#5A6B61] whitespace-pre-wrap">{analysis}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {isPro && started && !loading && (
          <div className="p-4 border-t border-[#E8E8E8] flex justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-[#EEF7F1] text-[#235037] text-sm font-medium hover:bg-[#235037]/10 transition-all"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
