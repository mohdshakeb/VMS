import PageHeader from '@/components/PageHeader'

export default function VisitHistory() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Visit History" />

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex flex-col items-center text-center max-w-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 mb-5">
            <i className="ri-calendar-schedule-line text-3xl text-zinc-400" />
          </div>
          <h2 className="text-base font-semibold text-zinc-800">No visit history yet</h2>
          <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
            Completed, cancelled, and rejected visits will appear here once activity begins.
          </p>
        </div>
      </div>
    </div>
  )
}
