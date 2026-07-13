import { useState } from 'react'
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
