export function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="space-y-2">
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Step ${current} of ${total}`}
        className="flex gap-1.5"
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={
              'h-1 flex-1 rounded-full transition-colors duration-300 ' +
              (i < current ? 'bg-accent' : 'bg-muted')
            }
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Step {current} of {total}
      </p>
    </div>
  )
}
