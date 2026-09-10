<template>
    <header v-if="componentVisible">
      <PageTitle
        v-if="titleVisible"
        :title="pageInfo.title"
        :description="pageInfo.description"
        :logo="pageInfo.logo"
      />
      <Nav v-if="navVisible" :links="pageInfo.navLinks" class="nav" />
    </header>
</template>

<script>
import PageTitle from '@/components/PageStrcture/PageTitle.vue';
import Nav from '@/components/PageStrcture/Nav.vue';
import { shouldBeVisible } from '@/utils/SectionHelpers';

export default {
  name: 'Header',
  components: {
    PageTitle,
    Nav,
  },
  props: {
    pageInfo: Object,
  },
  computed: {
    componentVisible() {
      return shouldBeVisible(this.$route.name);
    },
    visibleComponents() {
      return this.$store.getters.visibleComponents;
    },
    titleVisible() {
      return this.visibleComponents.pageTitle;
    },
    navVisible() {
      return this.visibleComponents.navigation;
    },
  },
};
</script>

<style scoped lang="scss">

@import '@/styles/media-queries.scss';

  header {
    margin: 0;
    min-height: var(--topbar-height);
    padding: .65rem var(--space-page);
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    background: rgba(3, 9, 20, .88);
    border-bottom: 1px solid var(--border-subtle, var(--outline-color));
    box-shadow: 0 10px 30px rgba(0, 0, 0, .2);
    align-items: center;
    align-content: flex-start;
    position: relative;
    z-index: 5;
    @include phone {
      min-height: auto;
      padding: .75rem 1rem;
      flex-direction: column-reverse;
      align-items: stretch;
    }
  }
</style>
