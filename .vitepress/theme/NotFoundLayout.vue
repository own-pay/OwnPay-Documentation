<script setup>
import { ref, computed, onMounted } from 'vue'
import { useData } from 'vitepress'

const { theme } = useData()

// Invalid path that user tried to visit
const invalidPath = ref('')
const searchQuery = ref('')

// Simple Levenshtein distance
const getLevenshteinDistance = (a, b) => {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length
  const matrix = []
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

// Traverse sidebar and extract all pages
const allPages = computed(() => {
  const pages = []
  const sidebar = theme.value.sidebar || {}

  const traverse = (items) => {
    if (!items) return
    for (const item of items) {
      if (item.link) {
        pages.push({
          title: item.text,
          link: item.link
        })
      }
      if (item.items) {
        traverse(item.items)
      }
    }
  }

  if (Array.isArray(sidebar)) {
    traverse(sidebar)
  } else {
    for (const key in sidebar) {
      traverse(sidebar[key])
    }
  }

  // De-duplicate pages
  const uniquePages = []
  const seen = new Set()
  for (const page of pages) {
    let link = page.link
    if (!link.startsWith('/')) link = '/' + link
    // Strip trailing .html or slash for matching
    const normalized = link.replace(/\.md$/, '').replace(/\.html$/, '').replace(/\/$/, '')
    if (!seen.has(normalized)) {
      seen.add(normalized)
      uniquePages.push({ title: page.title, link })
    }
  }

  // Fallback default list if sidebar is empty
  if (uniquePages.length === 0) {
    return [
      { title: 'User Guide Overview', link: '/user-guide/' },
      { title: 'Developer Guide Overview', link: '/developer/' },
      { title: 'Installation Guide', link: '/user-guide/installation' },
      { title: 'Introduction', link: '/user-guide/introduction' },
      { title: 'Payment Gateways', link: '/user-guide/gateways/gateways' },
      { title: 'Webhooks Setup', link: '/developer/webhooks' },
      { title: 'Plugin Development', link: '/developer/plugin-development' }
    ]
  }

  return uniquePages
})

// Calculate match score for suggestions based on user path
const suggestions = computed(() => {
  if (!invalidPath.value) return []

  const currentPathClean = invalidPath.value.toLowerCase().replace(/[-_/]/g, ' ')
  const queryWords = currentPathClean.split(/\s+/).filter(w => w.length > 1)

  if (queryWords.length === 0) return []

  const scored = allPages.value.map(page => {
    let score = 0
    const pageTitle = page.title.toLowerCase()
    const pageLink = page.link.toLowerCase().replace(/[-_/]/g, ' ')

    for (const word of queryWords) {
      // Direct matches
      if (pageTitle.includes(word)) {
        score += 12
      }
      if (pageLink.includes(word)) {
        score += 6
      }

      // Fuzzy matches against words in title
      const titleWords = pageTitle.split(/\s+/)
      for (const tw of titleWords) {
        if (tw.length > 2) {
          const dist = getLevenshteinDistance(word, tw)
          if (dist === 0) score += 10
          else if (dist === 1) score += 6
          else if (dist === 2) score += 2
        }
      }

      // Fuzzy matches against link segments
      const linkSegments = pageLink.split(/\s+/)
      for (const seg of linkSegments) {
        if (seg.length > 2) {
          const dist = getLevenshteinDistance(word, seg)
          if (dist === 0) score += 8
          else if (dist === 1) score += 4
        }
      }
    }

    return { ...page, score }
  })

  // Filter out zero score, sort by score desc, take top 4
  return scored
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
})

// Popular fallback suggestions (if no fuzzy matches found)
const popularLinks = computed(() => {
  return [
    { title: 'Installation Guide', link: '/user-guide/installation', desc: 'Deploy and configure OwnPay on your servers.' },
    { title: 'Developer Overview', link: '/developer/', desc: 'PHP & Node.js SDK integration.' },
    { title: 'Payment Gateways', link: '/user-guide/gateways/gateways', desc: 'Activate and configure Stripe, bKash, SSLCommerz, etc.' },
    { title: 'Webhooks Setup', link: '/developer/webhooks', desc: 'Setup and verify webhook notifications.' }
  ]
})

// Filter pages in real-time as user types in local search bar
const filteredPages = computed(() => {
  if (!searchQuery.value) return []
  const q = searchQuery.value.toLowerCase()
  return allPages.value
    .filter(p => p.title.toLowerCase().includes(q) || p.link.toLowerCase().includes(q))
    .slice(0, 5)
})

onMounted(() => {
  invalidPath.value = window.location.pathname
})

const triggerGlobalSearch = () => {
  const event = new KeyboardEvent('keydown', {
    key: 'k',
    code: 'KeyK',
    keyCode: 75,
    which: 75,
    ctrlKey: true,
    metaKey: true,
    bubbles: true,
    cancelable: true
  })
  window.dispatchEvent(event)
}
</script>

<template>
  <div class="op-404">
    <div class="op-404__container">
      <!-- Typography / Illustration -->
      <div class="op-404__graphic">
        <div class="op-404__number">404</div>
        <div class="op-404__badge">Lost in Transit</div>
      </div>

      <h1 class="op-404__title">Page Not Found</h1>
      <p class="op-404__lead">
        We couldn't find the page you were looking for. The link might be broken or the page has moved.
      </p>

      <!-- Realtime Search bar -->
      <div class="op-404__search-section">
        <div class="op-404__search-wrapper">
          <svg class="op-404__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Type to search docs..."
            class="op-404__search-input"
          />
        </div>
        
        <!-- Interactive search suggestions -->
        <div v-if="searchQuery && filteredPages.length > 0" class="op-404__search-results">
          <a
            v-for="page in filteredPages"
            :key="page.link"
            :href="page.link"
            class="op-404__search-item"
          >
            <span class="op-404__search-item-title">{{ page.title }}</span>
            <span class="op-404__search-item-link">{{ page.link }}</span>
          </a>
        </div>
        <div v-else-if="searchQuery" class="op-404__search-results-empty">
          No matches found. Try <button @click="triggerGlobalSearch" class="op-404__inline-search-btn">Global Search (⌘K)</button>
        </div>
      </div>

      <!-- Auto URL suggestions (Did you mean...?) -->
      <div v-if="suggestions.length > 0" class="op-404__suggestions">
        <h2 class="op-404__sub-title">Did you mean to visit?</h2>
        <div class="op-404__grid">
          <a
            v-for="page in suggestions"
            :key="page.link"
            :href="page.link"
            class="op-404__card"
          >
            <div class="op-404__card-icon">👉</div>
            <div class="op-404__card-content">
              <h3>{{ page.title }}</h3>
              <p>{{ page.link }}</p>
            </div>
          </a>
        </div>
      </div>

      <!-- Popular Topics fallback (if no auto matches or just generally helpful) -->
      <div v-else class="op-404__popular">
        <h2 class="op-404__sub-title">Popular Documentation Topics</h2>
        <div class="op-404__grid">
          <a
            v-for="page in popularLinks"
            :key="page.link"
            :href="page.link"
            class="op-404__card"
          >
            <div class="op-404__card-icon">⚡</div>
            <div class="op-404__card-content">
              <h3>{{ page.title }}</h3>
              <p>{{ page.desc }}</p>
            </div>
          </a>
        </div>
      </div>

      <!-- Global search trigger and back to home -->
      <div class="op-404__actions">
        <a href="/" class="op-404__btn op-404__btn--primary">Back to Homepage</a>
        <button @click="triggerGlobalSearch" class="op-404__btn op-404__btn--secondary">
          Open Global Search <kbd class="op-404__kbd">⌘K</kbd>
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.op-404 {
  padding: 80px 24px 100px;
  background-color: var(--vp-c-bg);
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--vp-font-family-base);
}

.op-404__container {
  max-width: 680px;
  width: 100%;
  text-align: center;
}

.op-404__graphic {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.op-404__number {
  font-family: 'Outfit', sans-serif;
  font-size: 110px;
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(135deg, var(--vp-c-brand-1) 0%, var(--vp-c-brand-2) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.04em;
  filter: drop-shadow(0 4px 12px rgba(15, 151, 237, 0.15));
}

.op-404__badge {
  position: absolute;
  bottom: -10px;
  background: var(--vp-c-brand-1);
  color: #ffffff;
  border: 2px solid var(--vp-c-bg);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 4px 14px;
  border-radius: 100px;
  box-shadow: 0 4px 12px rgba(15, 151, 237, 0.2);
}

.op-404__title {
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 16px 0 8px;
  letter-spacing: -0.01em;
}

.op-404__lead {
  font-size: 16px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 32px;
}

/* Search bar styling */
.op-404__search-section {
  position: relative;
  margin-bottom: 40px;
  text-align: left;
}

.op-404__search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.op-404__search-icon {
  position: absolute;
  left: 16px;
  width: 18px;
  height: 18px;
  color: var(--vp-c-text-3);
  pointer-events: none;
}

.op-404__search-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  font-size: 15px;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  outline: none;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  transition: all 200ms ease;
}

.op-404__search-input:focus {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px var(--vp-c-brand-soft);
}

.op-404__search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  margin-top: 6px;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.1);
  z-index: 50;
  overflow: hidden;
}

.op-404__search-item {
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  text-decoration: none;
  transition: background 150ms ease;
}

.op-404__search-item:last-child {
  border-bottom: none;
}

.op-404__search-item:hover {
  background: var(--vp-c-bg-soft);
}

.op-404__search-item-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.op-404__search-item-link {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin-top: 2px;
}

.op-404__search-results-empty {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  margin-top: 6px;
  padding: 16px;
  font-size: 14px;
  color: var(--vp-c-text-2);
  text-align: center;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.1);
  z-index: 50;
}

.op-404__inline-search-btn {
  background: none;
  border: none;
  color: var(--vp-c-brand-1);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.op-404__suggestions, .op-404__popular {
  margin-bottom: 40px;
  text-align: left;
}

.op-404__sub-title {
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.op-404__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 580px) {
  .op-404__grid {
    grid-template-columns: 1fr;
  }
}

.op-404__card {
  display: flex;
  gap: 14px;
  padding: 16px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  text-decoration: none;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.op-404__card:hover {
  transform: translateY(-2px);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 8px 16px -4px rgba(15, 23, 42, 0.06);
}

.op-404__card-icon {
  font-size: 18px;
  margin-top: 1px;
}

.op-404__card-content h3 {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 4px;
}

.op-404__card-content p {
  font-size: 12.5px;
  color: var(--vp-c-text-2);
  margin: 0;
  line-height: 1.4;
}

.op-404__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

@media (max-width: 480px) {
  .op-404__actions {
    flex-direction: column;
    align-items: stretch;
  }
}

.op-404__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 14.5px;
  font-weight: 600;
  border-radius: 100px;
  text-decoration: none;
  cursor: pointer;
  transition: all 200ms ease;
}

.op-404__btn--primary {
  background: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
}

.op-404__btn--primary:hover {
  background: var(--vp-button-brand-hover-bg);
  color: #fff;
}

.op-404__btn--secondary {
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.op-404__btn--secondary:hover {
  border-color: var(--vp-c-text-2);
}

.op-404__kbd {
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  padding: 2px 6px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  color: var(--vp-c-text-3);
  margin-left: 4px;
}
</style>
