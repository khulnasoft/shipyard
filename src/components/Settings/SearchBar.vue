<template>
  <form @submit.prevent="searchSubmitted"
    :class="minimalSearch ? 'minimal' : 'normal'">
    <label v-if="!minimalSearch" for="filter-tiles">{{ $t('search.search-label') }}</label>
    <div class="search-wrap">
      <span class="search-icon">
        <svg width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </span>
      <input
        id="filter-tiles"
        v-model="input"
        ref="filter"
        :placeholder="minimalSearch ? '' : $t('search.search-placeholder')"
        v-on:input="userIsTypingSomething"
        @keydown.esc="clearFilterInput" />
      <span v-if="input.length > 0" class="search-badge">⌘K</span>
      <i v-if="input.length > 0" class="clear-search"
        :title="$t('search.clear-search-tooltip')"
        @click="clearFilterInput">x</i>
      <p v-if="searchNote && input.length > 0" class="web-search-note">
        {{ searchNote }}
      </p>
    </div>
  </form>
</template>

<script>
import router from '@/router';
import ArrowKeyNavigation from '@/utils/ArrowKeyNavigation';
import ErrorHandler from '@/utils/ErrorHandler';
import { getCustomKeyShortcuts } from '@/utils/ConfigHelpers';
import { getSearchEngineFromBang, findUrlForSearchEngine, stripBangs } from '@/utils/Search';
import {
  searchEngineUrls, defaultSearchEngine,
  defaultSearchOpeningMethod, searchBangs as defaultSearchBangs,
} from '@/utils/defaults';

export default {
  name: 'FilterTile',
  props: { minimalSearch: Boolean },
  data: () => ({
    input: '',
    akn: new ArrowKeyNavigation(),
    getCustomKeyShortcuts,
  }),
  computed: {
    active() { return !this.$store.state.modalOpen; },
    searchPrefs() { return this.$store.getters.webSearch || {}; },
    urlDetected() {
      return this.searchPrefs.openUrlsDirectly && this.isUrlLike(this.input.trim());
    },
    searchNote() {
      if (this.urlDetected) return this.$t('search.enter-to-open-url');
      if (!this.searchPrefs.disableWebSearch) return this.$t('search.enter-to-search-web');
      return '';
    },
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeyPress);
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeyPress);
  },
  methods: {
    handleKeyPress(event) {
      const currentElem = document.activeElement.id;
      const { key, keyCode } = event;
      const notAlreadySearching = currentElem !== 'filter-tiles';
      if (!this.active) return;
      if (/^[/:!a-zA-Z]$/.test(key) && notAlreadySearching) {
        if (this.$refs.filter) this.$refs.filter.focus();
        this.userIsTypingSomething();
      } else if (/^[0-9]$/.test(key)) {
        this.handleHotKey(key);
      } else if (keyCode >= 37 && keyCode <= 40) {
        this.akn.arrowNavigation(keyCode);
      } else if (keyCode === 27) {
        this.clearFilterInput();
      }
    },
    userIsTypingSomething() {
      this.$emit('user-is-searchin', this.input);
    },
    clearFilterInput() {
      this.input = '';
      this.userIsTypingSomething();
      document.activeElement.blur();
      this.akn.resetIndex();
    },
    handleHotKey(key) {
      const sections = this.$store.getters.sections || [];
      const usersHotKeys = this.getCustomKeyShortcuts(sections);
      usersHotKeys.forEach((hotkey) => {
        if (hotkey.hotkey === parseInt(key, 10)) {
          if (hotkey.url) window.open(hotkey.url, '_blank');
        }
      });
    },
    launchWebSearch(url, method) {
      switch (method) {
        case 'newtab': window.open(url, '_blank'); break;
        case 'sametab': window.open(url, '_self'); break;
        case 'workspace': router.push({ name: 'workspace', query: { url } }); break;
        default: ErrorHandler(`Unknown opening method: ${method}`); window.open(url, '_blank');
      }
    },
    searchSubmitted() {
      const { searchPrefs } = this;
      if (!searchPrefs.disableWebSearch) {
        const input = this.input.trim();
        const openingMethod = searchPrefs.openingMethod || defaultSearchOpeningMethod;
        if (searchPrefs.openUrlsDirectly && input && this.isUrlLike(input)) {
          const url = /^https?:\/\//.test(input) ? input : `https://${input}`;
          this.launchWebSearch(url, openingMethod);
          this.clearFilterInput();
          return;
        }
        const bangList = {
          ...defaultSearchBangs,
          ...(searchPrefs.searchBangs || {}),
        };
        const searchBang = getSearchEngineFromBang(this.input, bangList);
        const searchEngine = searchPrefs.searchEngine || defaultSearchEngine;
        const desiredSearchEngine = searchBang || searchEngine;
        const isCustomSearch = (searchPrefs.searchEngine === 'custom'
        && searchPrefs.customSearchEngine);
        let searchUrl = isCustomSearch
          ? searchPrefs.customSearchEngine
          : findUrlForSearchEngine(desiredSearchEngine, searchEngineUrls);
        if (searchUrl) {
          searchUrl += encodeURIComponent(stripBangs(this.input, bangList));
          this.launchWebSearch(searchUrl, openingMethod);
          this.clearFilterInput();
        }
      }
    },
    isUrlLike(input) {
      return /^(https?:\/\/)?([\w-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/.test(input.trim());
    },
  },
};
</script>

<style scoped lang="scss">
@import '@/styles/media-queries.scss';

form.normal {
  display: flex;
  align-items: center;
  width: 100%;
  background: var(--search-field-background);
  border: 1px solid var(--search-border-color);
  border-radius: 999px;
  padding: 0.3rem 0.75rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.1);

  &:focus-within {
    border-color: var(--search-focus-border-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15), 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .search-wrap {
    display: flex;
    align-items: center;
    width: 100%;
    position: relative;

    .search-icon {
      display: flex;
      align-items: center;
      color: var(--text-muted);
      margin-right: 0.5rem;
      flex-shrink: 0;
      svg { opacity: 0.7; }
    }

    input {
      display: inline-block;
      width: 100%;
      height: 1.4rem;
      padding: 0 0.25rem;
      outline: none;
      border: none;
      background: transparent;
      color: var(--text-primary);
      font-size: 0.8rem;
      font-family: var(--font-body);

      &::placeholder {
        color: var(--text-muted);
      }
    }

    .search-badge {
      font-size: 0.65rem;
      color: var(--text-muted);
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.2);
      padding: 0.1rem 0.35rem;
      border-radius: 3px;
      margin-left: 0.5rem;
      flex-shrink: 0;
      font-family: var(--font-monospace);
    }

    .clear-search {
      color: var(--text-muted);
      padding: 0 0.2rem;
      font-style: normal;
      font-size: 0.9rem;
      opacity: var(--dimming-factor);
      border-radius: 50%;
      cursor: pointer;
      transition: opacity 0.15s;
      &:hover { opacity: 1; color: var(--text-primary); }
    }

    .web-search-note {
      margin: 0 0.5rem;
      font-size: 0.7rem;
      color: var(--text-muted);
      opacity: var(--dimming-factor);
      white-space: nowrap;
    }
  }
}

form.minimal {
  display: flex;
  align-items: center;
  label { display: none; }
  .search-wrap {
    display: flex;
    align-items: center;
    width: 100%;
    input {
      font-size: 0.9rem;
    }
  }
}

@include phone {
  form.normal {
    border-radius: var(--curve-factor);
    .search-wrap .web-search-note { display: none; }
  }
}
</style>
