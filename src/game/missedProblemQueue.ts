import type { Problem } from './types'

/**
 * Spaced-repetition queue for problems the child answered incorrectly.
 *
 * A missed problem isn't asked again right away (that would feel like being
 * put on the spot); instead it waits a few problems before it becomes
 * eligible to reappear, and even then it only reappears sometimes. This
 * keeps the "you'll see it again" reinforcement subtle rather than making
 * every mistake instantly repeat.
 */
export interface MissedProblem {
  problem: Problem
  /** How many more problems must be presented before this one may reappear. */
  problemsUntilDue: number
}

/** Smallest and largest number of other problems shown before a miss can reappear. */
const MIN_DELAY = 1
const MAX_DELAY = 3

/** Once a miss is due, only reintroduce it this often; otherwise keep it waiting and ask a fresh problem instead. */
const RESHOW_PROBABILITY = 0.4

/** Cap on how many misses we track at once, so a rough streak doesn't queue up too much repetition. */
const MAX_QUEUE_SIZE = 3

/** Adds a freshly missed problem to the queue with a randomized delay before it's eligible to reappear. */
export function enqueueMissedProblem(
  queue: MissedProblem[],
  problem: Problem,
  random: () => number = Math.random,
): MissedProblem[] {
  const delay = MIN_DELAY + Math.floor(random() * (MAX_DELAY - MIN_DELAY + 1))
  const nextQueue = [...queue, { problem, problemsUntilDue: delay }]

  // Drop the oldest miss once the queue overflows, keeping the most recent ones.
  return nextQueue.length > MAX_QUEUE_SIZE ? nextQueue.slice(nextQueue.length - MAX_QUEUE_SIZE) : nextQueue
}

/** Counts down every queued miss by one problem. Call this once per new problem shown, regardless of what it was. */
export function advanceMissedProblemQueue(queue: MissedProblem[]): MissedProblem[] {
  return queue.map((entry) => ({ ...entry, problemsUntilDue: Math.max(0, entry.problemsUntilDue - 1) }))
}

/**
 * Tries to pull a due (delay elapsed) missed problem back out of the queue so it can be
 * asked again. Returns null when nothing is due yet, or when a due entry loses the reshow
 * roll -- in both cases the caller should fall back to generating a fresh problem.
 */
export function takeDueMissedProblem(
  queue: MissedProblem[],
  random: () => number = Math.random,
): { problem: Problem; queue: MissedProblem[] } | null {
  const dueIndex = queue.findIndex((entry) => entry.problemsUntilDue === 0)
  if (dueIndex === -1) return null
  if (random() >= RESHOW_PROBABILITY) return null

  const problem = queue[dueIndex].problem
  const remainingQueue = [...queue.slice(0, dueIndex), ...queue.slice(dueIndex + 1)]
  return { problem, queue: remainingQueue }
}
