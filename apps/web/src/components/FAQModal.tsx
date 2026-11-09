'use client'

import { useState, useEffect } from 'react'
import { HelpCircle, X } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQModalProps {
  faq: FAQItem[]
}

export default function FAQModal({ faq }: FAQModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Ecouter l'event dispatche par le bouton FAQ dans la top bar
  useEffect(() => {
    const handler = () => setIsOpen(true)
    window.addEventListener('open-faq', handler)
    return () => window.removeEventListener('open-faq', handler)
  }, [])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/35 animate-fade-in"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#235037] p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">FAQ</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center text-white"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="space-y-4">
            {faq.map((item, index) => (
              <div
                key={index}
                className="group relative p-4 rounded-xl border border-[#E8E8E8] bg-white hover:bg-[#EEF7F1]/50 transition-all duration-300"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#235037] rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-base font-semibold text-[#1a2e22] mb-2 group-hover:text-[#235037] transition-colors">
                  {item.question}
                </h3>
                <p className="text-[#5A6B61] leading-relaxed text-sm">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
