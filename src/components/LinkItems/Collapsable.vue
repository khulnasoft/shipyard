<template>
  <div
    v-bind:class="[
    { 'is-open': isExpanded, 'full-height': cutToHeight },
    `collapsable ${rowColSpanClass}`, sectionClassName
    ]"
    :style="`${color ? 'background: '+color : ''}; ${sanitizeCustomStyles(customStyles)};`"
  >
    <input
      :id="sectionKey"
      class="toggle"
      type="checkbox"
      v-model="checkboxState"
      tabIndex="-1"
    >
    <label :for="sectionKey" class="lbl-toggle" tabindex="-1"
      @mouseup.right="openContextMenu" @contextmenu.prevent
      @long-press="openContextMenu" v-longPress="500">
      <Icon v-if="icon" :icon="icon" size="small" :url="title" class="section-icon" />
      <h3>{{ title }}</h3>
      <span class="section-badge" v-if="itemCount > 0">{{ itemCount }}</span>
      <span class="view-all-link"
        v-if="showViewAll"
        @click.stop="navigateToSection">View all →</span>
      <EditModeIcon v-if="isEditMode" @click="openEditModal"
        v-tooltip="editTooltip()" class="edit-mode-item" />
      <OpenIcon @click.prevent.stop="openContextMenu" @contextmenu.prevent
        class="edit-mode-item" />
    </label>
    <div class="collapsible-content">
      <div class="content-inner">
        <slot></slot>
        </div>
    </div>
  </div>
</template>

<script>
import longPress from '@/directives/LongPress';
import { localStorageKeys } from '@/utils/defaults';
import Icon from '@/components/LinkItems/ItemIcon.vue';
import EditModeIcon from '@/assets/interface-icons/interactive-editor-edit-mode.svg';
import OpenIcon from '@/assets/interface-icons/config-open-settings.svg';

export default {
  name: 'CollapsableContainer',
  props: {
    uniqueKey: String, // Generated unique ID
    title: String, // The section title
    icon: String, // An optional section icon
    collapsed: Boolean, // Optional override collapse state
    cols: Number, // Set section horizontal col span / width
    rows: Number, // Set section vertical row span / height
    color: String, // Optional color override
    customStyles: String, // Optional custom stylings
    cutToHeight: Boolean, // To set section height with content height
  },
  components: {
    Icon,
    EditModeIcon,
    OpenIcon,
  },
  directives: {
    longPress,
  },
  computed: {
    isEditMode() { return this.$store.state.editMode; },
    sectionKey() { return `collapsible-${this.uniqueKey}`; },
    collapseClass() { return !this.isExpanded ? ' is-collapsed' : 'is-open'; },
    rowColSpanClass() {
      const { rows, cols, checkSpanNum } = this;
      return `${checkSpanNum(cols, 'col')} ${checkSpanNum(rows, 'row')}`;
    },
    sectionClassName() {
      if (!this.title) return 'unnamed-section';
      return `section_${this.title.replaceAll(' ', '-').toLowerCase()}`;
    },
    itemCount() {
      const items = this.$slots.default ? this.$slots.default() : [];
      const itemNodes = items.filter(n => n.componentInstance && n.componentInstance.$options.name === 'Item');
      return itemNodes.length;
    },
    showViewAll() { return this.uniqueKey && this.itemCount > 0; },
    /* Used to fetch initial collapse state */
    isExpanded: {
      get() {
        if (this.collapsed !== undefined) return !this.collapsed;
        const collapseStateObject = this.locallyStoredCollapseStates();
        if (collapseStateObject[this.uniqueKey] !== undefined) {
          return collapseStateObject[this.uniqueKey];
        }
        return true;
      },
      set(newState) {
        const collapseState = this.locallyStoredCollapseStates();
        collapseState[this.uniqueKey] = newState;
        localStorage.setItem(localStorageKeys.COLLAPSE_STATE, JSON.stringify(collapseState));
      },
    },
  },
  data: () => ({
    checkboxState: true,
  }),
  mounted() {
    this.checkboxState = this.isExpanded;
  },
  watch: {
    checkboxState(newState) {
      this.isExpanded = newState;
      this.updateLocalStorage(); // Save every change immediately
    },
    uniqueKey(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.refreshCollapseState(); // Refresh state when key changes
      }
    },
  },
  methods: {
    refreshCollapseState() {
      this.checkboxState = this.isExpanded;
    },
    updateLocalStorage() {
      const collapseState = this.locallyStoredCollapseStates();
      collapseState[this.uniqueKey] = this.checkboxState;
      localStorage.setItem(localStorageKeys.COLLAPSE_STATE, JSON.stringify(collapseState));
    },
    /* Either expand or collapse section, based on it's current state */
    toggle() {
      this.checkboxState = !this.checkboxState;
    },
    navigateToSection() {
      if (!this.title) return;
      const parse = (s) => s.replace(' ', '-').toLowerCase().trim();
      const sectionIdentifier = parse(this.title);
      this.$router.push({ path: `/home/${sectionIdentifier}` });
    },
    /* Check that row & column span is valid */
    checkSpanNum(span, classPrefix) {
      const maxSpan = 6;
      let numSpan = /^\d*$/.test(span) ? parseInt(span, 10) : 1;
      numSpan = (numSpan > maxSpan) ? maxSpan : numSpan;
      return `${classPrefix}-${numSpan}`;
    },
    /* Removes all special characters, except those allowed in valid CSS */
    sanitizeCustomStyles(userCss) {
      return userCss ? userCss.replace(/[^a-zA-Z0-9- :;.]/g, '') : '';
    },
    /* Returns local storage collapse state data, and if not yet set then initialized is */
    locallyStoredCollapseStates() {
      // If not yet set, then call initialize
      if (!localStorage[localStorageKeys.COLLAPSE_STATE]) {
        localStorage.setItem(localStorageKeys.COLLAPSE_STATE, JSON.stringify({}));
        return {};
      }
      // Otherwise, return value of local storage
      return JSON.parse(localStorage[localStorageKeys.COLLAPSE_STATE]);
    },
    openEditModal() {
      this.$emit('openEditSection');
    },
    openContextMenu(e) {
      this.$emit('openContextMenu', e);
    },
    editTooltip() {
      const content = this.$t('interactive-editor.edit-section.edit-tooltip');
      return { content, trigger: 'hover focus', delay: { show: 100, hide: 0 } };
    },
  },
};
</script>

<style scoped lang="scss">
@import '@/styles/media-queries.scss';

.collapsable {
  width: 100%; width: stretch; height: fit-content; margin: 0; padding: 0;
  border-radius: var(--radius-panel, var(--curve-factor));
  border: 1px solid var(--border-subtle);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  background: var(--surface-1);
  transition: border-color 0.2s, box-shadow 0.2s;
  &:hover {
    border-color: rgba(59,130,246,0.3);
    box-shadow: 0 2px 8px rgba(0,0,0,0.3),
      0 0 4px rgba(59,130,246,0.05);
  }
  grid-row-start: span 1;
  &.row-2 { grid-row-start: span 2; }
  &.row-3 { grid-row-start: span 3; }
  &.row-4 { grid-row-start: span 4; }
  &.row-5 { grid-row-start: span 5; }
  &.row-6 { grid-row-start: span 6; }
  grid-column-start: span 1;
  @include tablet-up {
    &.col-2, &.col-3, &.col-4, &.col-5, &.col-6 {
      grid-column-start: span 2;
    }
  }
  @include laptop-up {
    &.col-2 { grid-column-start: span 2; }
    &.col-3, &.col-4, &.col-5, &.col-6 {
      grid-column-start: span 3;
    }
  }
  @include monitor-up {
    &.col-2 { grid-column-start: span 2; }
    &.col-3 { grid-column-start: span 3; }
    &.col-4 { grid-column-start: span 4; }
    &.col-5 { grid-column-start: span 5; }
    &.col-6 { grid-column-start: span 6; }
  }
  input[type='checkbox'] { display: none; }
  label.lbl-toggle {
    outline: none; display: flex; align-items: center; gap: 0.5rem;
    padding: 0.55rem 0.75rem; cursor: pointer;
    border-radius: var(--radius-panel, var(--curve-factor));
    transition: all 0.2s ease-out; text-align: left;
    color: var(--item-group-heading-text-color);
    background: var(--surface-1); border-bottom: 1px solid var(--border-subtle);
    font-size: 0.85rem; font-weight: 600;
    h3 { margin: 0; padding: 0; font-size: 0.85rem; font-weight: 600; }
    .section-icon { display: inline-flex; margin-right: 0.25rem; opacity: 0.7; }
    &:hover { color: var(--item-group-heading-text-color-hover); background: var(--surface-2); }
    &::before {
      content: '▸'; font-size: 0.7rem;
      vertical-align: middle; margin-right: 0.25rem;
      opacity: 0.4; transition: transform 0.25s;
    }
  }
  input.toggle:checked + .lbl-toggle::before { transform: rotate(90deg); opacity: 0.7; }
  input.toggle:checked + .lbl-toggle {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  .collapsible-content {
    max-height: 0px; overflow: hidden;
    transition: max-height .25s ease-in-out;
    background: transparent; border-radius: 0;
  }
  input.toggle:checked + .lbl-toggle + .collapsible-content {
    max-height: var(--section-max-height);
  }
  .collapsible-content .content-inner { padding: 0.5rem; }
  .section-badge {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 1.2rem; height: 1.2rem;
    padding: 0 0.35rem;
    font-size: 0.65rem; font-weight: 700; color: var(--primary);
    background: rgba(59,130,246,0.12);
    border: 1px solid rgba(59,130,246,0.25);
    border-radius: 999px; margin-left: auto; flex-shrink: 0;
  }
  .view-all-link {
    font-size: 0.7rem; color: var(--text-muted); cursor: pointer;
    flex-shrink: 0; margin-left: 0.5rem;
    opacity: 0; transition: opacity 0.15s, color 0.15s;
    &:hover { color: var(--primary); }
  }
  .lbl-toggle:hover { .view-all-link { opacity: 1; } }
  .edit-mode-item {
    width: 1rem; height: 1rem; opacity: 0.3;
    transition: all 0.2s; flex-shrink: 0;
  }
  &:hover { .edit-mode-item { opacity: 0.7; } }
  &:hover { label.lbl-toggle::before { opacity: 0.7; } }
  @include phone-up {
    &.is-open.full-height {
      height: auto; display: flex; align-items: normal; flex-direction: column;
      .collapsible-content { width: 100%; height: 100%; }
    }
  }
}
</style>
