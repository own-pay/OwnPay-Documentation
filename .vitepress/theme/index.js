import DefaultTheme from 'vitepress/theme'
import { h, defineComponent } from 'vue'
import { useData } from 'vitepress'
import HomeLayout from './HomeLayout.vue'
import './vars.css'
import './home.css'

const CustomLayout = defineComponent({
  setup() {
    const { frontmatter } = useData()
    return () =>
      frontmatter.value.customHome
        ? h(HomeLayout)
        : h(DefaultTheme.Layout)
  },
})

export default {
  extends: DefaultTheme,
  Layout: CustomLayout,
}
