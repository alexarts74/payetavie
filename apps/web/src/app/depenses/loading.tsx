export default function DepensesLoading() {
  return (
    <div className="p-4 sm:p-8 animate-pulse">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="h-10 bg-[#E8E8E8] rounded-xl w-48" />

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card rounded-2xl p-5 h-24" style={{ background: '#E8E8E8' }} />
          ))}
        </div>

        {/* Table */}
        <div className="card rounded-2xl p-6 h-80" style={{ background: '#E8E8E8' }} />
      </div>
    </div>
  )
}
