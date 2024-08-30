<script lang="ts">
  export let ranks: Array<{ day: number; scores: number; rank: number }>;
</script>

<div class="chart-container">

</div>

<style>
  .chart-container {
    width: 640px;
    height: 200px;
    background-color: rgba(255,255,255,0.1);
    border-radius: 12px;
    margin: 0 16px;
  }
  /* path {
    stroke: var(--color-active);
    opacity: 1;
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-width: 2px;
    fill: none;
  }

  .tooltip {
    position: absolute;
    padding: 10px;
    border-radius: 10px;
    color: var(--color-lightest);
    background-color: rgba(0, 0, 0, 0.4);
    font-size: 0.75rem;
    width: max-content;
    z-index: 2;
    pointer-events: none;
  }
  .tooltip-point {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: var(--color-dark);
    border: 3px solid var(--color-active);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 1;
  }
  .tooltip-line {
    position: absolute;
    width: 2px;
    height: 200px;
    background-color: var(--color-active);
    pointer-events: none;
  } */
</style>
