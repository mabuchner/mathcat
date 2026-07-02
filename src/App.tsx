import { useState } from 'react'
import styles from './App.module.css'
import { GameScreen } from './components/GameScreen'
import { MainMenu } from './components/MainMenu'
import { SettingsPanel } from './components/SettingsPanel'
import { useSettings } from './settings/useSettings'

type Screen = 'menu' | 'game' | 'settings'

function App() {
  const { settings, setSettings } = useSettings()
  const [screen, setScreen] = useState<Screen>('menu')

  return (
    <div className={styles.app}>
      <main className={styles.main}>
        {screen === 'menu' && (
          <MainMenu onPlay={() => setScreen('game')} onSettings={() => setScreen('settings')} />
        )}
        {screen === 'game' && (
          <GameScreen settings={settings} onHome={() => setScreen('menu')} />
        )}
        {screen === 'settings' && (
          <SettingsPanel settings={settings} onChange={setSettings} onClose={() => setScreen('menu')} />
        )}
      </main>
    </div>
  )
}

export default App
