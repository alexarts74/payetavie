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
      <div className="hidden sm:grid grid-cols-[1fr_100px_120px_100px_40px] gap-3 px-2 text-xs font-semibold text-[#5A6B61]  uppercase tracking-wide">
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
            className="card rounded-xl p-3 sm:p-0 sm:rounded-none sm:bg-transparent sm:border-0 sm:shadow-none "
          >
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px_120px_100px_40px] gap-3 items-center">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-[#E8E8E8] hidden sm:block flex-shrink-0" />
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  placeholder="Description de la prestation"
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E8E8]  bg-white text-sm text-[#1a2e22]  focus:outline-none focus:ring-2 focus:ring-[#235037]/20/50 transition-all placeholder:text-[#5A6B61]/60"
                />
              </div>
              <div className="flex sm:block items-center gap-2">
                <span className="text-xs text-[#5A6B61] sm:hidden">Qte:</span>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E8E8]  bg-white text-sm text-[#1a2e22]  text-right focus:outline-none focus:ring-2 focus:ring-[#235037]/20/50 transition-all"
                />
              </div>
              <div className="flex sm:block items-center gap-2">
                <span className="text-xs text-[#5A6B61] sm:hidden">Prix:</span>
                <input
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 rounded-lg border border-[#E8E8E8]  bg-white text-sm text-[#1a2e22]  text-right focus:outline-none focus:ring-2 focus:ring-[#235037]/20/50 transition-all"
                />
              </div>
              <div className="flex sm:block items-center gap-2">
                <span className="text-xs text-[#5A6B61] sm:hidden">Total:</span>
                <span className="text-sm font-medium text-[#1a2e22]  text-right block px-3 py-2">
                  {lineTotal.toFixed(2)} €
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length <= 1}
                className="p-2 rounded-lg text-[#5A6B61]/60 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed self-end sm:self-center"
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
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-[#E8E8E8]  text-sm font-medium text-[#5A6B61]  hover:text-[#235037] hover:border-[#235037]/30 transition-all w-full justify-center"
      >
        <Plus className="w-4 h-4" />
        Ajouter une ligne
      </button>

      {/* Totals */}
      <div className="border-t border-[#E8E8E8]  pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[#5A6B61] ">Total HT</span>
          <span className="font-medium text-[#1a2e22] ">{totalHt.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#5A6B61] ">TVA ({globalTvaRate}%)</span>
          <span className="font-medium text-[#1a2e22] ">{tvaAmount.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between text-base font-semibold border-t border-[#E8E8E8]  pt-2">
          <span className="text-[#1a2e22] ">Total TTC</span>
          <span className="text-[#235037]">{totalTtc.toFixed(2)} €</span>
        </div>
      </div>
    </div>
  )
}
