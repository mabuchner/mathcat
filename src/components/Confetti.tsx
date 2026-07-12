import { useMemo, type CSSProperties } from 'react'
import styles from './Confetti.module.css'

const COLORS = ['#fbbf24', '#f87171', '#34d399', '#60a5fa', '#a78bfa', '#f472b6']
const PIECE_COUNT = 40

interface Piece {
  id: number
  left: number
  color: string
  delay: number
  duration: number
  drift: number
  rotation: number
}

interface PieceStyle extends CSSProperties {
  '--drift': string
  '--rotation': string
}

export function Confetti() {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: PIECE_COUNT }, (_, id) => ({
        id,
        left: Math.random() * 100,
        color: COLORS[id % COLORS.length],
        delay: Math.random() * 0.6,
        duration: 2.2 + Math.random() * 1.4,
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
          backgroundColor: piece.color,
          animationDelay: `${piece.delay}s`,
          animationDuration: `${piece.duration}s`,
          '--drift': `${piece.drift}px`,
          '--rotation': `${piece.rotation}deg`,
        }
        return <span key={piece.id} className={styles.piece} style={style} />
      })}
    </div>
  )
}
