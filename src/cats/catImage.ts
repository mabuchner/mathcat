const CATAAS_BASE_URL = 'https://cataas.com/cat'

/**
 * Builds a URL for a random cat photo. cataas.com returns image bytes directly (no JSON,
 * no API key), so this is meant to be used as an <img src>, not fetched. The cache-busting
 * query param stops the browser (and the service worker's stale-while-revalidate cache) from
 * quietly reusing the last image for what should be a brand new reward.
 */
export function buildRandomCatUrl(random: () => number = Math.random): string {
  const cacheBuster = `${Date.now()}-${Math.floor(random() * 1_000_000)}`
  return `${CATAAS_BASE_URL}?${cacheBuster}`
}
