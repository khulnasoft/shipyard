<template>
  <div class="workspace">
    <SideBar
      :sections="sections"
      @launch-app="launchApp"
      @launch-widget="launchWidget"
      :initUrl="initialUrl"
    />
    <WebContent v-if="!isMultiTaskingEnabled" :url="url" />
    <MultiTaskingWebContent v-else :url="url" />
    <WidgetView v-if="widgets" :widgets="widgets" />
  </div>
</template>

<script>
import HomeMixin from '@/mixins/HomeMixin';
import SideBar from '@/components/Workspace/SideBar';
import WebContent from '@/components/Workspace/WebContent';
import WidgetView from '@/components/Workspace/WidgetView';
import MultiTaskingWebContent from '@/components/Workspace/MultiTaskingWebContent';
import Defaults from '@/utils/defaults';

export default {
  name: 'Workspace',
  mixins: [HomeMixin],
  components: {
    SideBar,
    WebContent,
    WidgetView,
    MultiTaskingWebContent,
  },
  data() {
    return {
      url: '',
      widgets: null,
    };
  },
  computed: {
    sections() {
      return this.$store.getters.sections;
    },
    appConfig() {
      return this.$store.getters.appConfig;
    },
    isMultiTaskingEnabled() {
      return Boolean(this.appConfig.enableMultiTasking);
    },
    initialUrl() {
      const route = this.$route;
      if (route.query?.url) return decodeURI(route.query.url);
      if (this.appConfig.workspaceLandingUrl) return this.appConfig.workspaceLandingUrl;
      return '';
    },
  },
  methods: {
    launchApp({ target, url }) {
      if (target === 'newtab') {
        window.open(url, '_blank');
      } else {
        this.url = url;
        this.widgets = null;
      }
    },
    launchWidget(widgets) {
      this.url = '';
      this.widgets = widgets;
    },
    initiateFontAwesome() {
      if (document.querySelector('script[data-fontawesome]')) return;
      const faKey = this.appConfig.fontAwesomeKey || Defaults.fontAwesomeKey;
      if (!faKey) return;
      const fontAwesomeScript = document.createElement('script');
      fontAwesomeScript.setAttribute('src', `https://kit.fontawesome.com/${faKey}.js`);
      fontAwesomeScript.setAttribute('crossorigin', 'anonymous');
      fontAwesomeScript.setAttribute('data-fontawesome', 'true');
      document.head.appendChild(fontAwesomeScript);
    },
  },
  mounted() {
    this.setTheme();
    this.initiateFontAwesome();
    this.url = this.initialUrl;
  },
};
</script>

<style scoped lang="scss">
.workspace {
  min-height: fit-content;
  display: flex;
  flex-direction: row;
  width: 100%;
}
:global(footer) {
  display: none;
}
</style>
