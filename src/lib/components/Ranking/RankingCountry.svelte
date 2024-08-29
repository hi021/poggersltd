<script lang="ts">
  import { COUNTRIES, tooltip } from "$lib/util";

  export let countryRank: number | undefined = undefined;
  export let country: string; // 2-letter country code
</script>

{#if countryRank}
  <td style="width: 4.25ch; text-align: end; padding-right: 3px;">
    #{countryRank}
  </td>
{/if}
<td style="width: 40px; line-height: 0; {!countryRank && 'margin-left: 8px;'}">
  <img
    class="osu-flag-small"
    alt={country}
    use:tooltip={{ content: COUNTRIES[country] }}
    src="/flags/{country}.svg" />
</td>
