'use client'

import { Plus, Trash2, GripVertical } from 'lucide-react'

export interface LineItemData {
  description: string
  quantity: number
  unit_price: number
  tva_rate: number
}

interface LineItemsEditorProps {
  items: LineItemData[]
  onChange: (items: LineItemData[]) => void
  globalTvaRate: number
}

export default function LineItemsEditor({ items, onChange, globalTvaRate }: LineItemsEditorProps) {
  const addItem = () => {
    onChange([...items, { description: '', quantity: 1, unit_price: 0, tva_rate: globalTvaRate }])
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof LineItemData, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    onChange(newItems)
  }

  const totalHt = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const tvaAmount = totalHt * globalTvaRate / 100
  const totalTtc = totalHt + tvaAmount

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="hidden sm:grid grid-cols-[1fr_100px_120px_100px_40px] gap-3 px-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
        <span>Description</span>
        <span className="text-right">Quantite</span>
        <span className="text-right">Prix unitaire</span>
        <span className="text-right">Total HT</span>
        <span></span>
      </div>

      {/* Items */}
      {items.map((item, index) => {
        const lineTotal = item.quantity * item.unit_price
        return (
          <div
            key={index}
            className="glass-card rounded-xl p-3 sm:p-0 sm:rounded-none sm:bg-transparent sm:border-0 sm:shadow-none sm:dark:bg-transparent"
          >
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px_120px_100px_40px] gap-3 items-center">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-zinc-300 dark:text-zinc-600 hidden sm:block flex-shrink-0" />
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  placeholder="Description de la prestation"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700/40 bg-white dark:bg-zinc-800/50 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                />
              </div>
              <div className="flex sm:block items-center gap-2">
                <span className="text-xs text-zinc-500 sm:hidden">Qte:</span>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700/40 bg-white dark:bg-zinc-800/50 text-sm text-zinc-900 dark:text-zinc-100 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
              <div className="flex sm:block items-center gap-2">
                <span className="text-xs text-zinc-500 sm:hidden">Prix:</span>
                <input
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700/40 bg-white dark:bg-zinc-800/50 text-sm text-zinc-900 dark:text-zinc-100 text-right focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
              <div className="flex sm:block items-center gap-2">
                <span className="text-xs text-zinc-500 sm:hidden">Total:</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 text-right block px-3 py-2">
                  {lineTotal.toFixed(2)} €
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length <= 1}
                className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed self-end sm:self-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      })}

      {/* Add button */}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700/40 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all w-full justify-center"
      >
        <Plus className="w-4 h-4" />
        Ajouter une ligne
      </button>

      {/* Totals */}
      <div className="border-t border-zinc-200 dark:border-zinc-700/40 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">Total HT</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{totalHt.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">TVA ({globalTvaRate}%)</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{tvaAmount.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-base font-semibold border-t border-zinc-200 dark:border-zinc-700/40 pt-2">
          <span className="text-zinc-900 dark:text-zinc-100">Total TTC</span>
          <span className="text-indigo-600 dark:text-indigo-400">{totalTtc.toFixed(2)} €</span>
        </div>
      </div>
    </div>
  )
}
