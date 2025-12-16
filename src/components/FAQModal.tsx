'use client'

import { useState } from 'react'
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

  return (
    <>
      {/* Bouton flottant en bas à droite */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        aria-label="Ouvrir la FAQ"
      >
        <HelpCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-br from-purple-500 to-pink-600 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-white">FAQ</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center text-white"
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
                    className="group relative p-4 rounded-xl border border-purple-100 hover:border-purple-300 bg-white hover:bg-purple-50 transition-all duration-300"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-purple-500 to-pink-600 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <h3 className="text-base font-semibold text-zinc-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {item.question}
                    </h3>
                    <p className="text-zinc-600 leading-relaxed text-sm">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

