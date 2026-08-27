import { useState } from 'react'
import { Confetti } from './Confetti'
import styles from './MainMenu.module.css'

export interface MainMenuProps {
  onPlay: () => void
  onSettings: () => void
  onHighScores: () => void
}

const shareData = {
  title: 'MathCat',
  text: 'Come practice math with me on MathCat! 🐱',
  url: window.location.href,
}

export function MainMenu({ onPlay, onSettings, onHighScores }: MainMenuProps) {
  const [linkCopied, setLinkCopied] = useState(false)
  // TEMPORARY: debug button to manually trigger confetti. Remove before shipping.
  const [confettiKey, setConfettiKey] = useState(0)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled the share sheet; nothing to do.
      }
      return
    }

    await navigator.clipboard.writeText(shareData.url)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  return (
    <div className={styles.menu}>
      {/* TEMPORARY: debug button to manually trigger confetti. Remove before shipping. */}
      <button
        type="button"
        onClick={() => setConfettiKey((key) => key + 1)}
        style={{ position: 'fixed', top: 8, left: 8, zIndex: 100 }}
      >
        🎉 Confetti
      </button>
      {confettiKey > 0 && <Confetti key={confettiKey} />}

      <p className={styles.logo}>🐱</p>
      <h1 className={styles.title}>MathCat</h1>
      <p className={styles.subtitle}>Math practice</p>

      <div className={styles.buttons}>
        <button type="button" className={`${styles.btn} ${styles.btnPlay}`} onClick={onPlay}>
          ▶️ Play
        </button>
        <button type="button" className={`${styles.btn} ${styles.btnSettings}`} onClick={onHighScores}>
          🏆 High Scores
        </button>
        <button type="button" className={`${styles.btn} ${styles.btnSettings}`} onClick={onSettings}>
          ⚙️ Settings
        </button>
      </div>

      <button type="button" className={styles.shareLink} onClick={handleShare}>
        {linkCopied ? (
          <>✅ <span className={styles.shareLinkText}>Link copied!</span></>
        ) : (
          <>📤 <span className={styles.shareLinkText}>Share with Friends</span></>
        )}
      </button>

      <p className={styles.buildInfo}>
        Build: {__BUILD_DATE__.slice(0, 16).replace('T', ' ')} UTC · {__COMMIT_HASH__}
      </p>
    </div>
  )
}
