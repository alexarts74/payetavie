export default function ProfileLoading() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="card rounded-2xl p-6 h-24" style={{ background: '#E8E8E8' }} />

      {/* Sections */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card rounded-2xl p-6 h-40" style={{ background: '#E8E8E8' }} />
      ))}
    </div>
  )
}
