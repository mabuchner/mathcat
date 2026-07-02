import styles from './CountdownRing.module.css'

export interface CountdownRingProps {
  remainingMs: number
  durationMs: number
  size?: number
}

const STROKE_WIDTH = 10

function colorForFraction(fraction: number): string {
  if (fraction > 0.5) return '#16a34a'
  if (fraction > 0.25) return '#f59e0b'
  return '#f97316'
}

export function CountdownRing({ remainingMs, durationMs, size = 96 }: CountdownRingProps) {
  const fraction = durationMs > 0 ? Math.min(1, Math.max(0, remainingMs / durationMs)) : 0
  const radius = (size - STROKE_WIDTH) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - fraction)
  const secondsLeft = Math.ceil(remainingMs / 1000)

  return (
    <svg
      className={styles.ring}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="timer"
      aria-label={`${secondsLeft} seconds left`}
    >
      <circle className={styles.track} cx={size / 2} cy={size / 2} r={radius} strokeWidth={STROKE_WIDTH} />
      <circle
        className={styles.progress}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={STROKE_WIDTH}
        stroke={colorForFraction(fraction)}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
      />
      <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" className={styles.label}>
        {secondsLeft}
      </text>
    </svg>
  )
}
