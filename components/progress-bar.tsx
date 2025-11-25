"use client"

export default function ProgressBar({ current, total }: { current: number; total: number }) {
  const percentage = (current / total) * 100

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Step {current} of {total}
        </h3>
        <span className="text-sm font-medium text-emerald-600">{Math.round(percentage)}%</span>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
