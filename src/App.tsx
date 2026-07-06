import { useState } from 'react'
import styles from './App.module.css'
import { GameScreen } from './components/GameScreen'
import { HighScoresScreen } from './components/HighScoresScreen'
import { MainMenu } from './components/MainMenu'
import { SettingsPanel } from './components/SettingsPanel'
import { useHighScores } from './scores/useHighScores'
import { useSettings } from './settings/useSettings'

type Screen = 'menu' | 'game' | 'settings' | 'highScores'

function App() {
  const { settings, setSettings } = useSettings()
  const { highScores, recordScore, resetScores } = useHighScores()
  const [screen, setScreen] = useState<Screen>('menu')

  return (
    <div className={styles.app}>
      <main className={styles.main}>
        {screen === 'menu' && (
          <MainMenu
            onPlay={() => setScreen('game')}
            onSettings={() => setScreen('settings')}
            onHighScores={() => setScreen('highScores')}
          />
        )}
        {screen === 'game' && (
          <GameScreen settings={settings} recordScore={recordScore} onHome={() => setScreen('menu')} />
        )}
        {screen === 'settings' && (
          <SettingsPanel settings={settings} onChange={setSettings} onClose={() => setScreen('menu')} />
        )}
        {screen === 'highScores' && (
          <HighScoresScreen highScores={highScores} onReset={resetScores} onClose={() => setScreen('menu')} />
        )}
      </main>
    </div>
  )
}

export default App
