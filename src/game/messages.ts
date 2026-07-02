const ENCOURAGEMENT_MESSAGES = [
  'So close! Try the next one!',
  "Nice try — you'll get the next one!",
  "Keep going, you're doing great!",
  "Almost! Let's try another.",
  'Mistakes help you learn. On to the next!',
  "You've got this — keep practicing!",
  'Good effort! Ready for another?',
] as const

export function pickEncouragement(previous?: string, random: () => number = Math.random): string {
  let message: string
  let attempts = 0
  do {
    message = ENCOURAGEMENT_MESSAGES[Math.floor(random() * ENCOURAGEMENT_MESSAGES.length)]
    attempts++
  } while (message === previous && attempts < 20)
  return message
}
