<template>
  <div class="indicator"
    v-tooltip="{
      content: statusText || otherStatusText,
      classes: ['status-tooltip'],
      delay: { show: 0, hide: 150 }
    }">
    <div :class="`dot dot-${color()}`"></div>
  </div>
</template>

<script>
export default {
  name: 'StatusIndicator',
  props: {
    statusText: String,
    statusSuccess: Boolean,
  },
  methods: {
    color() {
      switch (this.statusSuccess) {
        case undefined: return ((new Date() - this.startTime) > 2000) ? 'grey' : 'yellow';
        case true: return 'green';
        default: return 'red';
      }
    },
  },
  data() {
    return {
      startTime: new Date(),
      otherStatusText: 'Checking...',
    };
  },
  mounted() {
    setTimeout(() => {
      if (!this.statusText) this.otherStatusText = 'Request timed out';
    }, 2000);
  },
};
</script>

<style scoped lang="scss">
.indicator {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  cursor: help;
  z-index: 4;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;

  &.dot-green {
    background-color: var(--success);
    box-shadow: 0 0 4px rgba(34, 197, 94, 0.5);
  }
  &.dot-red {
    background-color: var(--danger);
    box-shadow: 0 0 4px rgba(239, 68, 68, 0.5);
  }
  &.dot-yellow {
    background-color: var(--warning);
    box-shadow: 0 0 4px rgba(234, 179, 8, 0.5);
  }
  &.dot-grey {
    background-color: var(--medium-grey);
  }
}
</style>

<style lang="scss">
.status-tooltip {
  background: var(--status-check-tooltip-background) !important;
  color: var(--status-check-tooltip-color);
  font-size: 0.8rem;
  z-index: 10;
  .tooltip-inner {
    border: 1px solid var(--border-subtle);
  }
  .tooltip-arrow {
    --description-tooltip-color: var(--status-color);
  }
}
</style>

<style lang="scss">
.status-tooltip {
  background: var(--status-check-tooltip-background) !important;
  color: var(--status-check-tooltip-color);
  font-size: 1rem;
  z-index: 10;
  &.tip-grey { --status-color: var(--medium-grey); }
  &.tip-green { --status-color: var(--success); }
  &.tip-yellow { --status-color: var(--warning); }
  &.tip-red { --status-color: var(--danger); }
  .tooltip-inner {
    border: 1px solid var(--status-color);
    // color: var(--status-color);
  }
  .tooltip-arrow {
    --description-tooltip-color: var(--status-color);
  }
}
</style>
