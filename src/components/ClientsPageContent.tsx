'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Building2, Mail, Phone, ChevronRight, UserX, UserCheck } from 'lucide-react'
import type { Client } from '@/types'
import ClientForm from '@/components/ClientForm'

interface ClientsPageContentProps {
  initialClients: Client[]
}

export default function ClientsPageContent({ initialClients }: ClientsPageContentProps) {
  const router = useRouter()
  const [clients, setClients] = useState(initialClients)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showInactive, setShowInactive] = useState(false)

  const filteredClients = clients.filter(c => {
    const matchesSearch = !search ||
      c.company_name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    const matchesActive = showInactive || c.is_active
    return matchesSearch && matchesActive
  })

  const activeCount = clients.filter(c => c.is_active).length

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              Clients
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              {activeCount} client{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/30"
          >
            <Plus className="w-4 h-4" />
            Nouveau client
          </button>
        </div>

        {/* Search & filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-up">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700/40 bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-400"
            />
          </div>
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              showInactive
                ? 'border-indigo-300 dark:border-indigo-500/40 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                : 'border-zinc-200 dark:border-zinc-700/40 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
            }`}
          >
            {showInactive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            {showInactive ? 'Masquer inactifs' : 'Voir inactifs'}
          </button>
        </div>

        {/* Client list */}
        {filteredClients.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center animate-fade-in">
            <Building2 className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              {search ? 'Aucun client trouve' : 'Aucun client'}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
              {search ? 'Essayez avec un autre terme de recherche' : 'Ajoutez votre premier client pour commencer'}
            </p>
            {!search && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/30"
              >
                <Plus className="w-4 h-4" />
                Ajouter un client
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 animate-slide-up">
            {filteredClients.map((client) => (
              <button
                key={client.id}
                onClick={() => router.push(`/freelance/clients/${client.id}`)}
                className={`w-full glass-card rounded-xl p-4 sm:p-5 text-left hover:shadow-md transition-all group ${
                  !client.is_active ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-sm font-bold text-white">
                      {client.company_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {client.company_name}
                      </h3>
                      {!client.is_active && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                          Inactif
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      {client.contact_name && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{client.contact_name}</span>
                      )}
                      {client.email && (
                        <span className="hidden sm:flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                          <Mail className="w-3 h-3" /> {client.email}
                        </span>
                      )}
                      {client.phone && (
                        <span className="hidden sm:flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                          <Phone className="w-3 h-3" /> {client.phone}
                        </span>
                      )}
                      {client.city && (
                        <span className="hidden md:inline text-xs text-zinc-500 dark:text-zinc-400">{client.city}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Client form modal */}
        {showForm && (
          <ClientForm
            onClose={() => setShowForm(false)}
            onSaved={(newClient) => {
              setClients(prev => [...prev, newClient])
            }}
          />
        )}
      </div>
    </div>
  )
}
