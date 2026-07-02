export interface Settings {
  tables: number[]
  countdownSeconds: number
  soundEnabled: boolean
  tickingEnabled: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  countdownSeconds: 10,
  soundEnabled: true,
  tickingEnabled: false,
}
