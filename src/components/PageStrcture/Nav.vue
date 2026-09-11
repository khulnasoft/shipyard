<template>
  <div class="sidebar-outer" v-if="allLinks && allLinks.length > 0">
    <div class="sidebar-header">
      <div class="logo-area">
        <svg
          width="24" height="24"
          viewBox="0 0 24 24"
          fill="none" stroke="var(--primary)" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <div class="logo-text">
          <span class="logo-name">Shipyard</span>
          <span class="logo-sub">Dev Command Center</span>
        </div>
      </div>
    </div>
    <nav id="nav" class="sidebar-nav">
      <template v-for="(link, index) in allLinks">
        <router-link v-if="!isUrl(link.path)"
          :key="`nav-${index}`"
          :to="link.path"
          class="nav-item"
          :title="link.title">
          <span class="nav-icon">
            <svg v-if="link.icon"
          :data-icon="link.icon"
          width="16" height="16"
          viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
            </svg>
            <svg v-else
          width="16" height="16"
          viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </span>
          <span class="nav-label">{{link.title}}</span>
        </router-link>
        <a v-else
          :key="`nav-a-${index}`"
          :href="link.path"
          :target="determineTarget(link)"
          class="nav-item"
          rel="noopener noreferrer"
          :title="link.title">
          <span class="nav-icon">
            <svg
              width="16" height="16"
              viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </span>
          <span class="nav-label">{{link.title}}</span>
        </a>
      </template>
    </nav>
  </div>
</template>

<script>
import { makePageSlug } from '@/utils/ConfigHelpers';
import { checkPageVisibility } from '@/utils/CheckPageVisibility';

export default {
  name: 'Nav',
  props: { links: Array },
  data: () => ({ isMobile: false }),
  computed: {
    allLinks() {
      const subPages = this.$store.getters.pages.filter(page => checkPageVisibility(page))
        .map(subPage => ({
          path: makePageSlug(subPage.name, 'home'),
          title: subPage.name,
          icon: subPage.icon,
        }));
      const navLinks = this.links || [];
      return [...navLinks, ...subPages];
    },
  },
  created() {
    this.isMobile = this.detectMobile();
  },
  methods: {
    detectMobile() { return document.body.clientWidth < 600; },
    isUrl(str) { return new RegExp(/(http|https):\/\/(\S+)(:[0-9]+)?/).test(str); },
    determineTarget(link) {
      if (!link.target) return '_blank';
      switch (link.target) {
        case 'sametab': return '_self';
        case 'newtab': return '_blank';
        case 'parent': return '_parent';
        case 'top': return '_top';
        default: return undefined;
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import '@/styles/media-queries.scss';

.sidebar-outer {
  display: flex;
  flex-direction: column;
  width: var(--sidebar-width);
  background: var(--background-darker);
  border-right: 1px solid var(--border-subtle);
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;

  .sidebar-header {
    padding: 0.75rem;
    border-bottom: 1px solid var(--border-subtle);
    flex-shrink: 0;

    .logo-area {
      display: flex;
      align-items: center;
      gap: 0.6rem;

      .logo-text {
        display: flex;
        flex-direction: column;
        line-height: 1.2;

        .logo-name {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .logo-sub {
          font-size: 0.6rem;
          color: var(--text-muted);
          font-weight: 400;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
      }
    }
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    padding: 0.4rem;
    gap: 0.15rem;
    flex: 1;

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.5rem 0.65rem;
      min-height: 2.2rem;
      text-decoration: none;
      color: var(--nav-link-text-color);
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--curve-factor);
      font-size: 0.8rem;
      font-weight: 500;
      transition: all 0.15s ease;
      position: relative;
      overflow: hidden;

      .nav-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 1.2rem;
        height: 1.2rem;
        opacity: 0.6;
        transition: opacity 0.15s;
      }

      .nav-label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &:hover {
        color: var(--nav-link-text-color-hover);
        background: var(--nav-link-background-color-hover);
        border-color: var(--border-subtle);

        .nav-icon { opacity: 1; }
      }

      &.router-link-active {
        color: var(--primary);
        background: rgba(59, 130, 246, 0.1);
        border-color: rgba(59, 130, 246, 0.3);
        box-shadow: inset 3px 0 0 var(--primary);

        .nav-icon { opacity: 1; }
      }
    }
  }

  @include tablet {
    position: fixed;
    left: 0;
    top: var(--topbar-height);
    bottom: 0;
    z-index: 4;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    width: 16rem;

    &.nav-visible {
      transform: translateX(0);
    }
  }
}
</style>
