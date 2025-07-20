<script lang="ts">
  import { tooltip } from "$lib/util";
  interface Props {
    gainedRanks?: number;
  }

  let { gainedRanks }: Props = $props();

  let text = $derived.by(() => {
    if (gainedRanks == null) return "New";
    if (gainedRanks > 0) return `Up by ${gainedRanks}`;
    if (gainedRanks < 0) return `Down by ${-gainedRanks}`;

    return "No change";
  });
  let className = $derived.by(() => {
    if (gainedRanks == null) return "circle";
    if (gainedRanks > 0) return "arrow";
    if (gainedRanks < 0) return "arrow-down";

    return "line";
  });
</script>

{#key text}
  <td style="width: 22px;" use:tooltip={{ content: text }}>
    <div class="rank-indicator {className}"></div>
  </td>
{/key}

<style>
  /* 16x11 px */
  .rank-indicator {
    margin: auto;
  }
  .arrow,
  .arrow-down {
    width: 0;
    height: 0;
    padding: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
  }
  .arrow {
    border-bottom: 11px solid var(--color-green);
  }
  .arrow-down {
    transform: rotate(180deg);
    border-bottom: 11px solid var(--color-red);
  }
  .line {
    width: 14px;
    height: 3px;
    background-color: var(--color-light);
  }
  .circle {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: var(--color-blue);
  }
</style>
