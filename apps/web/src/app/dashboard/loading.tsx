export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card rounded-2xl p-5 h-28" style={{ background: '#E8E8E8' }} />
        ))}
      </div>

      {/* Two-column content */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card rounded-2xl p-6 h-72" style={{ background: '#E8E8E8' }} />
        <div className="card rounded-2xl p-6 h-72" style={{ background: '#E8E8E8' }} />
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card rounded-2xl p-6 h-48" style={{ background: '#E8E8E8' }} />
        <div className="card rounded-2xl p-6 h-48" style={{ background: '#E8E8E8' }} />
      </div>
    </div>
  )
}
