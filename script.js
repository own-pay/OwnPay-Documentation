// ===== GitHub Star Count =====
async function updateGitHubStars() {
  try {
    const response = await fetch('https://api.github.com/repos/own-pay/OwnPay');
    const data = await response.json();
    const stars = data.stargazers_count;
    let displayStars = stars >= 1000 ? (stars / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : stars.toString();
    const githubLink = document.querySelector('a[href*="github.com/own-pay/OwnPay"]');
    if (githubLink && !githubLink.querySelector('.github-stars-badge')) {
      const badge = document.createElement('span');
      badge.className = 'github-stars-badge';
      badge.innerHTML = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/></svg><span class="star-count">${displayStars}</span>`;
      githubLink.appendChild(badge);
    }
  } catch (e) { console.log('GitHub stars fetch failed:', e); }
}

// ===== Dynamic Changelog from GitHub =====
async function loadChangelog() {
  const container = document.getElementById('changelog-content');
  const loading = document.getElementById('changelog-loading');
  if (!container || container.dataset.loaded) return;

  try {
    const response = await fetch('https://raw.githubusercontent.com/own-pay/OwnPay/main/CHANGELOG.md');
    if (!response.ok) throw new Error('Failed to fetch changelog');
    const markdown = await response.text();

    // Simple markdown to HTML conversion
    let html = markdown
      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      // List items
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Wrap consecutive li's in ul
      .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
      // Blockquotes
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      // Paragraphs (lines that aren't already wrapped)
      .replace(/^(?!<[hublo])(.+)$/gm, '<p>$1</p>')
      // Clean up empty paragraphs
      .replace(/<p>\s*<\/p>/g, '')
      // Horizontal rules
      .replace(/^---$/gm, '<hr/>');

    container.innerHTML = html;
    container.dataset.loaded = 'true';
    if (loading) loading.style.display = 'none';
  } catch (e) {
    if (loading) {
      loading.innerHTML = '<p>Could not load changelog from GitHub. <a href="https://github.com/own-pay/OwnPay/blob/main/CHANGELOG.md" target="_blank" rel="noopener">View on GitHub</a></p>';
    }
  }
}

// ===== Initialize =====
function init() {
  updateGitHubStars();
  loadChangelog();
  addSubscribeForm();
}

// ===== Email Subscribe Form =====
function addSubscribeForm() {
  const footer = document.querySelector('#footer, footer');
  if (!footer || footer.querySelector('.footer-subscribe')) return;

  const form = document.createElement('div');
  form.className = 'footer-subscribe';
  form.innerHTML = `
    <form onsubmit="event.preventDefault(); this.querySelector('button').textContent='Subscribed! ✓'; this.querySelector('input').value=''; setTimeout(() => this.querySelector('button').textContent='Subscribe', 2000);" style="display:flex;gap:8px;max-width:340px;margin:0 auto;">
      <input type="email" placeholder="Enter your email" required style="flex:1;padding:8px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:13px;background:#fff;color:#111827;outline:none;" />
      <button type="submit" style="padding:8px 16px;background:#0D9373;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap;">Subscribe</button>
    </form>
  `;

  // Insert before the community tagline
  const footerBottom = footer.querySelector('.flex.items-center.justify-between');
  if (footerBottom) {
    footerBottom.parentNode.insertBefore(form, footerBottom);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

const observer = new MutationObserver(() => init());
observer.observe(document.body, { childList: true, subtree: true });
