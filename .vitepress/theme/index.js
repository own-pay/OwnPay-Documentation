import DefaultTheme from 'vitepress/theme'
import { h, defineComponent } from 'vue'
import { useData } from 'vitepress'
import HomeLayout from './HomeLayout.vue'
import NotFoundLayout from './NotFoundLayout.vue'
import Footer from './Footer.vue'
import './vars.css'
import './home.css'

const CustomLayout = defineComponent({
  setup() {
    const { frontmatter, page } = useData()
    return () => {
      if (page.value.isNotFound) {
        return h(DefaultTheme.Layout, null, {
          'not-found': () => h(NotFoundLayout)
        })
      }
      return frontmatter.value.customHome
        ? h(HomeLayout)
        : h(DefaultTheme.Layout, null, {
            'doc-after': () => h(Footer, { class: 'op-footer-doc' })
          })
    }
  },
})

export default {
  extends: DefaultTheme,
  Layout: CustomLayout,
}
