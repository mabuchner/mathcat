import { useState } from 'react'
import fallbackCat from '../cats/fallback-cat.svg'
import styles from './CatReward.module.css'

export interface CatRewardProps {
  catUrl: string
  onContinue: () => void
}

export function CatReward({ catUrl, onContinue }: CatRewardProps) {
  const [imageErrored, setImageErrored] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [loadedForUrl, setLoadedForUrl] = useState(catUrl)

  // Reset load/error state whenever the image changes, so a stale flag from a
  // previous cat can't stick to the new one.
  if (catUrl !== loadedForUrl) {
    setImageErrored(false)
    setImageLoaded(false)
    setLoadedForUrl(catUrl)
  }

  const src = imageErrored ? fallbackCat : catUrl

  return (
    <div className={styles.card}>
      <p className={styles.title}>Correct! 🎉</p>
      <div className={styles.imageWrap}>
        {!imageLoaded && (
          <div className={styles.placeholder}>
            <span className={styles.placeholderPaws}>🐾</span>
            <span className={styles.placeholderText}>Loading cat…</span>
          </div>
        )}
        <img
          className={`${styles.image} ${imageLoaded ? '' : styles.imageHidden}`}
          src={src}
          onLoad={() => setImageLoaded(true)}
          onError={() => { setImageErrored(true); setImageLoaded(true) }}
          alt="A reward cat"
        />
      </div>
      <button type="button" className={styles.continueButton} onClick={onContinue}>
        Next →
      </button>
    </div>
  )
}
