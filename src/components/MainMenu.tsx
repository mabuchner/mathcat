import styles from './MainMenu.module.css'

export interface MainMenuProps {
  onPlay: () => void
  onSettings: () => void
  onHighScores: () => void
}

export function MainMenu({ onPlay, onSettings, onHighScores }: MainMenuProps) {
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
    </div>
  )
}
