<script lang="ts">
	import { COUNTRIES } from "$lib/constants";
  import { tooltip } from "$lib/util";

  export let countryCode: string;
  export let className: string = "osu-flag-small unselectable";
  export let style: string = "";
  export let tooltipContent: string | undefined = undefined;

  const countryName = COUNTRIES[countryCode] || countryCode;
</script>

{#if tooltipContent}
    <picture use:tooltip={{ content: tooltipContent }} {style} class={className}>
      <source srcset={`/flags/${countryCode}.svg`} type="image/svg+xml" />
      <img src="/flags/XX.svg" alt="{countryName} country flag" />
    </picture>
{:else}
  <picture {style} class={className}>
    <source srcset={`/flags/${countryCode}.svg`} type="image/svg+xml" />
    <img src="/flags/XX.svg" alt="{countryName} country flag" />
  </picture>
{/if}

<style>
  img, picture {
    display: inline-block;
    vertical-align: middle;
  }
</style>
