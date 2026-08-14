import styles from './CountdownRing.module.css'

export interface CountdownRingProps {
  remainingMs: number
  durationMs: number
  size?: number
  label?: string
}

const STROKE_WIDTH = 10

/* The drawing always uses this coordinate space; the size prop scales the whole
   ring proportionally (stroke and label included), so small rings stay legible. */
const VIEWBOX_SIZE = 96

function colorForFraction(fraction: number): string {
  if (fraction > 0.5) return '#16a34a'
  if (fraction > 0.25) return '#f59e0b'
  return '#f97316'
}

export function CountdownRing({ remainingMs, durationMs, size = 96, label }: CountdownRingProps) {
  const fraction = durationMs > 0 ? Math.min(1, Math.max(0, remainingMs / durationMs)) : 0
  const radius = (VIEWBOX_SIZE - STROKE_WIDTH) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - fraction)
  const displayLabel = label ?? String(Math.ceil(remainingMs / 1000))

  return (
    <svg
      className={styles.ring}
      width={size}
      height={size}
      viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      role="timer"
      aria-label={`${displayLabel} left`}
    >
      <circle className={styles.track} cx={VIEWBOX_SIZE / 2} cy={VIEWBOX_SIZE / 2} r={radius} strokeWidth={STROKE_WIDTH} />
      <circle
        className={styles.progress}
        cx={VIEWBOX_SIZE / 2}
        cy={VIEWBOX_SIZE / 2}
        r={radius}
        strokeWidth={STROKE_WIDTH}
        stroke={colorForFraction(fraction)}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
      />
      <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" className={styles.label}>
        {displayLabel}
      </text>
    </svg>
  )
}
