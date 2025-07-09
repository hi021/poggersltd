<script lang="ts">
  import { tooltip } from "$lib/util";

  interface Props {
    gainedRanks: number | undefined;
  }

  let { gainedRanks }: Props = $props();

  let text: string = $state("No change");
  let className: string = $state("line");

  $effect(() => {
    if (gainedRanks == null) {
      className = "circle";
      text = "New";
    } else if (gainedRanks > 0) {
      className = "arrow";
      text = `Up by ${gainedRanks}`;
    } else if (gainedRanks < 0) {
      className = "arrow-down";
      text = `Down by ${-gainedRanks}`;
    }
  });
</script>

<td style="width: 22px;" use:tooltip={{ content: text }}>
  <div class={"rank-indicator " + className}></div>
</td>

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
