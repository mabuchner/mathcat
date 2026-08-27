import { useMemo, type CSSProperties } from 'react'
import styles from './Confetti.module.css'

const COLORS = ['#fbbf24', '#f87171', '#34d399', '#60a5fa', '#a78bfa', '#f472b6']
const PIECE_COUNT = 40

interface Piece {
  id: number
  left: number
  top: number
  color: string
  delay: number
  duration: number
  fadeInDuration: number
  drift: number
  rotation: number
}

interface PieceStyle extends CSSProperties {
  '--drift': string
  '--rotation': string
  '--fall-distance': string
}

export function Confetti() {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: PIECE_COUNT }, (_, id) => ({
        id,
        left: Math.random() * 100,
        // Spread pieces across a range of starting heights, well above the
        // viewport, so they don't all spawn in a single visible line.
        top: -8 - Math.random() * 25,
        color: COLORS[id % COLORS.length],
        delay: Math.random() * 0.6,
        duration: 2.2 + Math.random() * 1.4,
        fadeInDuration: 0.15 + Math.random() * 0.4,
        drift: (Math.random() - 0.5) * 120,
        rotation: Math.random() * 360 + 360,
      })),
    [],
  )

  return (
    <div className={styles.container} aria-hidden="true">
      {pieces.map((piece) => {
        const style: PieceStyle = {
          left: `${piece.left}%`,
          top: `${piece.top}vh`,
          backgroundColor: piece.color,
          animationDelay: `${piece.delay}s, ${piece.delay}s`,
          animationDuration: `${piece.duration}s, ${piece.fadeInDuration}s`,
          '--drift': `${piece.drift}px`,
          '--rotation': `${piece.rotation}deg`,
          // End well past the bottom of the screen regardless of how far
          // above the viewport this piece started.
          '--fall-distance': `${120 - piece.top}vh`,
        }
        return <span key={piece.id} className={styles.piece} style={style} />
      })}
    </div>
  )
}
