<script setup>
const icons = {
  github:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>`,
  users:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  youtube:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.524 3.545 12 3.545 12 3.545s-7.525 0-9.387.508a3.003 3.003 0 0 0-2.11 2.11C0 8.025 0 12 0 12s0 3.975.503 5.837a3.003 3.003 0 0 0 2.11 2.11c1.862.508 9.387.508 9.387.508s7.525 0 9.387-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.975 24 12 24 12s0-3.975-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  extarrow: `<svg viewBox="0 0 11 11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9L9 2M9 2H4M9 2v5"/></svg>`
}

const footerColumns = [
  [
    { text: 'About', href: 'https://ownpay.org/about' },
    { text: 'OwnPay', href: 'https://ownpay.org' },
    { text: 'Blog', href: 'https://blog.ownpay.org' },
    { text: 'Partners', href: 'https://ownpay.org/partners' },
    { text: 'Change Log', href: '/user-guide/changelog' }
  ],
  [
    { text: 'GitHub', href: 'https://github.com/own-pay/ownpay' },
    { text: 'Discussion', href: 'https://github.com/own-pay/OwnPay/discussions' },
    { text: 'Community', href: 'https://Facebook.com/groups/ownpayorg' },
    { text: 'Contributing', href: 'https://github.com/own-pay/OwnPay/blob/main/CONTRIBUTING.md' },
    { text: 'Contributor', href: 'https://OwnPay.org/contributor' }
  ],
  [
    { text: 'Sponsor', href: 'https://OwnPay.org/sponsor' },
    { text: 'Donate', href: 'https://ownpay.org/donate' },
    { text: 'Terms & Condition', href: 'https://ownpay.org/terms-condition' },
    { text: 'Privacy', href: 'https://OwnPay.org/privacy' },
    { text: 'Disclaimer', href: 'https://OwnPay.org/disclaimer' }
  ],
  [
    { text: 'Get Support', href: 'https://support.ownpay.org' },
    { text: 'Security', href: 'https://ownpay.org/security' },
    { text: 'Installation', href: '/user-guide/installation' },
    { text: 'User Guide', href: '/user-guide/' },
    { text: 'Requirements', href: '/user-guide/requirements' }
  ],
  [
    { text: 'Plugins Directory', href: 'https://plugins.ownpay.org' },
    { text: 'Developer Docs', href: '/developer/' },
    { text: 'API Reference', href: 'https://docs.ownpay.org' },
    { text: 'SDK & Plugins', href: 'https://ownpay.org/sdk-and-plugins' },
    { text: 'Plugin Development', href: '/developer/plugin-types/gateway-development' },
    { text: 'Hook Reference', href: '/developer/hooks-reference' }
  ]
]

const isOutgoing = (href) => {
  if (!href) return false
  return href.startsWith('http://') || href.startsWith('https://')
}

const getLinkAttributes = (href) => {
  if (!href) return {}
  const isExt = isOutgoing(href)
  if (!isExt) return {}

  const url = href.toLowerCase()
  const isOwnPayDomain = url.includes('ownpay.org')
  const isOwnPayGit = url.includes('github.com/own-pay/ownpay')

  if (isOwnPayDomain || isOwnPayGit) {
    return {
      target: '_blank',
      rel: 'noopener'
    }
  } else {
    return {
      target: '_blank',
      rel: 'nofollow noopener noreferrer'
    }
  }
}
</script>

<template>
  <footer class="op-footer">
    <div class="op-container">
      <div class="op-footer__row">
        <div class="op-footer__brand">
          <div class="op-footer__brand-top">
            <img src="/dark_mode.svg" class="op-footer__logo-img" alt="OwnPay Logo" style="height: 24px; width: auto; display: block;" />
          </div>
          <span class="op-footer__brand-sub">Self-hosted, open-source payment infrastructure.</span>
          <div class="op-footer__social">
            <a href="https://github.com/own-pay/OwnPay" target="_blank" rel="noopener" v-html="icons.github" aria-label="GitHub" data-tooltip="GitHub"></a>
            <a href="https://fb.com/ownpay.org" target="_blank" rel="noopener" v-html="icons.facebook" aria-label="Facebook Page" data-tooltip="Facebook Page"></a>
            <a href="https://fb.com/groups/ownpay.org" target="_blank" rel="noopener" v-html="icons.users" aria-label="Facebook Group Community" data-tooltip="Facebook Group"></a>
            <a href="https://youtube.com/@ownpayorg" target="_blank" rel="noopener" v-html="icons.youtube" aria-label="YouTube" data-tooltip="YouTube"></a>
          </div>
        </div>
        <div class="op-footer__cols">
          <div v-for="(col, index) in footerColumns" :key="index" class="op-footer__col">
            <a
              v-for="item in col"
              :key="item.text"
              :href="item.href"
              v-bind="getLinkAttributes(item.href)"
            >
              {{ item.text }}
              <span v-if="isOutgoing(item.href)" class="op-nav__link-ext" v-html="icons.extarrow" style="width:10px;height:10px;display:inline-flex;opacity:0.5;margin-left:4px"></span>
            </a>
          </div>
        </div>
      </div>
      <div class="op-footer__bottom">
        <span class="op-footer__copy">© 2026 OwnPay</span>
        <span class="op-footer__community">Built by the Community, for the Community.</span>
        <span class="op-footer__license">AGPL-3.0 Licensed</span>
      </div>
    </div>
  </footer>
</template>
