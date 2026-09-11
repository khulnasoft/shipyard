<template>
  <header v-if="componentVisible" class="app-header">
    <div class="header-left">
      <PageTitle
        v-if="titleVisible"
        :title="pageInfo.title"
        :description="pageInfo.description"
        :logo="pageInfo.logo"
      />
      <Nav v-if="navVisible" :links="pageInfo.navLinks" class="nav" />
    </div>
    <div class="header-center">
      <SearchBar ref="searchBar"
        @user-is-searchin="userIsTypingSomething"
        v-if="searchVisible"
      />
    </div>
    <div class="header-right">
      <ThemeSelector />
      <LayoutSelector :displayLayout="$store.getters.layout" />
      <ItemSizeSelector :iconSize="itemSizeBound" />
      <ConfigLauncher />
      <AuthButtons v-if="userState !== 0" :userType="userState" />
    </div>
  </header>
</template>

<script>
import PageTitle from '@/components/PageStrcture/PageTitle.vue';
import Nav from '@/components/PageStrcture/Nav.vue';
import SearchBar from '@/components/Settings/SearchBar';
import ThemeSelector from '@/components/Settings/ThemeSelector';
import LayoutSelector from '@/components/Settings/LayoutSelector';
import ItemSizeSelector from '@/components/Settings/ItemSizeSelector';
import ConfigLauncher from '@/components/Settings/ConfigLauncher';
import AuthButtons from '@/components/Settings/AuthButtons';
import { shouldBeVisible } from '@/utils/SectionHelpers';
import { getUserState } from '@/utils/Auth';

export default {
  name: 'Header',
  components: {
    PageTitle,
    Nav,
    SearchBar,
    ThemeSelector,
    LayoutSelector,
    ItemSizeSelector,
    ConfigLauncher,
    AuthButtons,
  },
  props: { pageInfo: Object },
  data: () => ({ itemSizeBound: '' }),
  computed: {
    componentVisible() { return shouldBeVisible(this.$route.name); },
    visibleComponents() { return this.$store.getters.visibleComponents; },
    titleVisible() { return this.visibleComponents.pageTitle; },
    navVisible() { return this.visibleComponents.navigation; },
    searchVisible() { return this.visibleComponents.searchBar; },
    userState() { return getUserState(); },
    layout() { return this.$store.getters.layout; },
    iconSize() { return this.$store.getters.iconSize; },
  },
  mounted() {
    this.itemSizeBound = this.iconSize;
  },
  methods: {
    userIsTypingSomething(something) {
      this.$emit('user-is-searchin', something);
    },
  },
};
</script>

<style scoped lang="scss">
@import '@/styles/media-queries.scss';

.app-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1rem;
  height: var(--topbar-height);
  min-height: var(--topbar-height);
  background: rgba(3, 7, 16, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-subtle);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 5;
  flex: 0 0 auto;

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;
    max-width: 480px;
    margin: 0 auto;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    flex-shrink: 0;
    margin-left: auto;
  }

  @include phone {
    flex-wrap: wrap;
    height: auto;
    min-height: auto;
    padding: 0.5rem 0.75rem;
    gap: 0.5rem;

    .header-left { order: 1; }
    .header-center { order: 2; max-width: 100%; flex-basis: 100%; }
    .header-right { order: 3; flex-wrap: wrap; }
  }
}
</style>
