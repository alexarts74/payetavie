export default function FacturesLoading() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card rounded-2xl p-5 h-24" style={{ background: '#E8E8E8' }} />
        ))}
      </div>

      {/* Table / list */}
      <div className="card rounded-2xl p-6 h-80" style={{ background: '#E8E8E8' }} />
    </div>
  )
}
