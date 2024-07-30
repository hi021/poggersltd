<script lang="ts">
  import { tooltip } from "$lib/util";
  export let gainedRanks: number | undefined;

  let text = "No change";
  let className = "line";

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
</script>

<td style="width: 22px;" use:tooltip={{ content: text }}>
  <div class={className} />
</td>
