export default function TopicLoading() {
  return (
    <div className="p-4 sm:p-8 animate-pulse">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="h-12 bg-[#E8E8E8] rounded-xl w-64" />

        {/* TL;DR / checklist card */}
        <div className="card rounded-2xl p-6 h-56" style={{ background: '#E8E8E8' }} />

        {/* Two columns: reminders + documents */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card rounded-2xl p-6 h-64" style={{ background: '#E8E8E8' }} />
          <div className="card rounded-2xl p-6 h-64" style={{ background: '#E8E8E8' }} />
        </div>

        {/* Bookmarks */}
        <div className="card rounded-2xl p-6 h-40" style={{ background: '#E8E8E8' }} />
      </div>
    </div>
  )
}
