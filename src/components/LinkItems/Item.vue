<template ref="container">
  <div :class="`item-wrapper wrap-size-${size} span-${makeColumnCount}`">
    <a @click="itemClicked"
      @long-press="openContextMenu"
      @contextmenu.prevent
      @mouseup.right="openContextMenu"
      v-longPress="true"
      :href="item.url"
      :target="anchorTarget"
      :class="`item ${makeClassList}`"
      v-tooltip="getTooltipOptions()"
      :rel="`${item.rel || 'noopener noreferrer'}`"
      tabindex="0"
      :id="`link-${item.id}`"
      :style="customStyle"
    >
      <div class="item-layout">
        <!-- Icon Block -->
        <div class="item-icon-block" :style="iconBlockStyle">
          <Icon :icon="itemIcon" :url="item.url" :size="size" :color="item.color"
            v-bind:style="customStyles" class="bounce" />
        </div>
        <!-- Content -->
        <div class="item-content">
          <div class="item-header-row">
            <span class="item-name"><span class="text">{{ item.title }}</span></span>
            <StatusIndicator
              class="status-indicator"
              v-if="enableStatusCheck"
              :statusSuccess="statusResponse ? statusResponse.successStatus : undefined"
              :statusText="statusResponse ? statusResponse.message : undefined"
            />
          </div>
          <p class="description">{{ item.description }}</p>
        </div>
        <!-- Action Arrow -->
        <span class="item-action-arrow">
          <svg width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </div>
      <!-- Edit icon (displayed only when in edit mode) -->
      <EditModeIcon v-if="isEditMode" class="edit-mode-item" @click="openItemSettings()" />
    </a>
    <!-- Right-click context menu -->
    <ContextMenu
      :show="contextMenuOpen && !isAddNew"
      v-click-outside="closeContextMenu"
      :posX="contextPos.posX"
      :posY="contextPos.posY"
      :id="`context-menu-${item.id}`"
      @launchItem="launchItem"
      @openItemSettings="openItemSettings"
      @openMoveItemMenu="openMoveItemMenu"
      @openDeleteItem="openDeleteItem"
    />
    <!-- Edit and move item menu modals -->
    <MoveItemTo v-if="isEditMode" :itemId="item.id" />
    <EditItem v-if="editMenuOpen" :itemId="item.id"
      @closeEditMenu="closeEditMenu"
      :isNew="isAddNew" :parentSectionTitle="parentSectionTitle" />
  </div>
</template>

<script>
import Icon from '@/components/LinkItems/ItemIcon.vue';
import StatusIndicator from '@/components/LinkItems/StatusIndicator';
import EditItem from '@/components/InteractiveEditor/EditItem';
import MoveItemTo from '@/components/InteractiveEditor/MoveItemTo';
import ContextMenu from '@/components/LinkItems/ItemContextMenu';
import StoreKeys from '@/utils/StoreMutations';
import ItemMixin from '@/mixins/ItemMixin';
import EditModeIcon from '@/assets/interface-icons/interactive-editor-edit-mode.svg';
import { modalNames } from '@/utils/defaults';

export default {
  name: 'Item',
  mixins: [ItemMixin],
  props: {
    itemSize: String,
    parentSectionTitle: String,
    isAddNew: Boolean,
    sectionWidth: Number,
    sectionDisplayData: Object,
  },
  components: {
    Icon,
    StatusIndicator,
    ContextMenu,
    MoveItemTo,
    EditItem,
    EditModeIcon,
  },
  computed: {
    itemIcon() {
      return this.item.icon || this.$store.getters.appConfig?.defaultIcon;
    },
    makeColumnCount() {
      if ((this.sectionDisplayData || {}).itemCountX) return this.sectionDisplayData.itemCountX;
      if (this.sectionWidth < 380) return 1;
      if (this.sectionWidth < 520) return 2;
      if (this.sectionWidth < 730) return 3;
      if (this.sectionWidth < 1000) return 4;
      if (this.sectionWidth < 1300) return 5;
      return 0;
    },
    makeClassList() {
      const { isAddNew, isEditMode, size } = this;
      return `size-${size} ${!this.itemIcon ? 'short' : ''} `
        + `${isAddNew ? 'add-new' : ''} ${isEditMode ? 'is-edit-mode' : ''}`;
    },
    iconBlockStyle() {
      const color = this.item.color || 'var(--primary)';
      return {
        '--icon-bg': `${color}18`,
        '--icon-border': `${color}33`,
      };
    },
    unicodeOpeningIcon() {
      const icons = {
        newtab: '"\\f360"',
        sametab: '"\\f24d"',
        parent: '"\\f3bf"',
        top: '"\\f102"',
        modal: '"\\f2d0"',
        workspace: '"\\f0b1"',
        clipboard: '"\\f0ea"',
      };
      return icons[this.accumulatedTarget] || '"\\f054"';
    },
  },
  filters: {
    shortUrl(value) {
      if (!value || typeof value !== 'string') return '';
      try {
        const url = new URL(value);
        return url.hostname;
      } catch (e) {
        const ipPattern = /^(\d{1,3}\.){3}\d{1,3}/;
        const match = value.match(ipPattern);
        if (match) return match[0];
        return '';
      }
    },
  },
  data() {
    return { editMenuOpen: false };
  },
  methods: {
    getTooltipOptions() {
      if (!this.item.description && !this.item.provider) return {};
      const description = this.item.description || '';
      const providerText = this.item.provider ? `<b>Provider</b>: ${this.item.provider}` : '';
      const lb1 = description && providerText ? '<br>' : '';
      const hotkeyText = this.item.hotkey ? `<br>Press '${this.item.hotkey}' to launch` : '';
      const tooltipText = providerText + lb1 + description + hotkeyText;
      const editText = this.$t('interactive-editor.edit-section.edit-tooltip');
      return {
        content: (this.isEditMode ? editText : tooltipText),
        trigger: 'hover focus',
        hideOnTargetClick: true,
        html: true,
        placement: this.statusResponse ? 'left' : 'auto',
        delay: { show: 600, hide: 200 },
        classes: `item-description-tooltip tooltip-is-${this.size}`,
      };
    },
    openItemSettings() {
      this.editMenuOpen = true;
      this.contextMenuOpen = false;
      this.$modal.show(modalNames.EDIT_ITEM);
      this.$store.commit(StoreKeys.SET_MODAL_OPEN, true);
    },
    closeEditMenu() {
      this.editMenuOpen = false;
      this.$modal.hide(modalNames.EDIT_ITEM);
      this.$store.commit(StoreKeys.SET_MODAL_OPEN, false);
    },
    openMoveItemMenu() {
      this.$modal.show(`${modalNames.MOVE_ITEM_TO}-${this.item.id}`);
      this.$store.commit(StoreKeys.SET_MODAL_OPEN, true);
      this.closeContextMenu();
    },
    openDeleteItem() {
      const parentSection = this.$store.getters.getParentSectionOfItem(this.item.id);
      const payload = { itemId: this.item.id, sectionName: parentSection.name };
      this.$store.commit(StoreKeys.REMOVE_ITEM, payload);
      this.closeContextMenu();
    },
  },
  mounted() {
    if (this.enableStatusCheck) {
      this.checkWebsiteStatus();
      if (this.statusCheckInterval > 0) {
        this.intervalId = setInterval(this.checkWebsiteStatus, this.statusCheckInterval * 1000);
      }
    }
  },
  beforeDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  },
};
</script>

<style lang="scss">
.item-wrapper {
  flex-grow: 1;
  flex-basis: 6rem;
  &.wrap-size-large { flex-basis: 12rem; }
  &.wrap-size-small {
    flex-grow: revert;
    &.span-1 { min-width: 100%; }
    &.span-2 { min-width: 50%; }
    &.span-3 { min-width: 33%; }
    &.span-4 { min-width: 25%; }
    &.span-5 { min-width: 20%; }
    &.span-6 { min-width: 16%; }
    &.span-7 { min-width: 14%; }
    &.span-8 { min-width: 12.5%; }
  }
  .item-url { display: none; }
}

.item {
  flex-grow: 1;
  color: var(--item-text-color);
  text-decoration: none;
  position: relative;
  transition: all 0.2s ease-in-out;

  .item-layout {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.5rem 0.7rem;
    min-height: 2.8rem;
  }

  .item-icon-block {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
    border-radius: 6px;
    background: var(--icon-bg, rgba(59, 130, 246, 0.1));
    border: 1px solid var(--icon-border, rgba(59, 130, 246, 0.2));
    overflow: hidden;
    transition: all 0.2s;
  }

  .item-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .item-header-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .item-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
  }

  .description {
    font-size: 0.72rem;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
    margin: 0;
  }

  .item-action-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 1.4rem;
    height: 1.4rem;
    color: var(--text-muted);
    opacity: 0;
    transition: all 0.15s;
    svg { width: 12px; height: 12px; }
  }

  /* Card styling */
  background: linear-gradient(135deg, rgba(10, 22, 40, 0.95), rgba(6, 11, 26, 0.95));
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-panel, var(--curve-factor));
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(59, 130, 246, 0.05);
  cursor: pointer;
  outline: 2px solid transparent;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.2s ease-in-out;

  &:hover {
    border-color: rgba(59, 130, 246, 0.4);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 8px rgba(59, 130, 246, 0.1);
    transform: translateY(-1px);

    .item-action-arrow { opacity: 1; }
    .item-icon-block {
      background: rgba(59, 130, 246, 0.18);
      border-color: rgba(59, 130, 246, 0.4);
    }
  }

  &:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  &.add-new {
    border: 1px dashed var(--primary);
    background: transparent;
  }

  &.is-edit-mode {
    .edit-mode-item {
      position: absolute;
      top: 0.2rem;
      right: 0.2rem;
      z-index: 2;
    }
  }
}

/* Status indicator adjustments */
.status-indicator {
  flex-shrink: 0;
}

/* Edit mode items */
.item .edit-mode-item {
  width: 1rem;
  height: 1rem;
}

/* Opening method icon hidden on hover */
.opening-method-icon { display: none; }
.item:hover .opening-method-icon { display: block; }

/* Small size adjustments */
.item.size-small .item-layout {
  padding: 0.3rem 0.5rem;
  min-height: 2rem;
}
.item.size-small .item-icon-block { width: 1.5rem; height: 1.5rem; }
.item.size-small .item-name { font-size: 0.78rem; }
.item.size-small .description { display: none; }

/* Medium size */
.item.size-medium .item-layout { min-height: 3rem; }

/* Large size */
.item.size-large .item-layout {
  min-height: 3.5rem;
  padding: 0.6rem 0.8rem;
}
.item.size-large .item-icon-block { width: 2.2rem; height: 2.2rem; }

/* Adjust positioning of status indicator */
a.item.is-edit-mode {
  .status-indicator { top: 0.5rem; }
}
</style>

<style lang="scss">
.disabled-link { pointer-events: none; }
.tooltip.item-description-tooltip { z-index: 7; }
</style>
