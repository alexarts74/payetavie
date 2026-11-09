export default function ClientsLoading() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      {/* Header + search bar */}
      <div className="card rounded-2xl p-5 h-16" style={{ background: '#E8E8E8' }} />

      {/* Client cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card rounded-2xl p-5 h-32" style={{ background: '#E8E8E8' }} />
        ))}
      </div>
    </div>
  )
}
