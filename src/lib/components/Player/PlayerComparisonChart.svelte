<script lang="ts">
	import { CHART_COLORS, CHART_RANK_COLORS } from "$lib/constants";
	import {
		createChartAxis,
		createChartContainer,
		createChartCrosshair,
		createChartLine,
		createChartTooltip,
		formatDate,
		formatNumber
	} from "$lib/util";
	import type { NumericAccessor } from "@unovis/ts";
	import { Crosshair, Direction, Tooltip, XYContainer } from "@unovis/ts";
	import { onMount } from "svelte";

	let {category, data} : { category: App.RankingCategory, data: {
		players: App.ComparisonChartPlayerCustomizable[];
		ranks: App.ComparisonChartEntryProcessed[];
	}}
	= $props();

	const x = (d: App.ComparisonChartEntryProcessed) => Number(d.date);
	const rankColors = (_: App.ComparisonChartEntryProcessed[], i: number) =>
		CHART_RANK_COLORS[i % CHART_RANK_COLORS.length];
	let rankY: NumericAccessor<App.ComparisonChartEntryProcessed>[] = [];
	let scoreY: NumericAccessor<App.ComparisonChartEntryProcessed>[] = [];
	let scoreColors: string[] = [];

	let rankChartElement = $state<HTMLElement>();
	let scoreChartElement = $state<HTMLElement>();
	let rankChart: XYContainer<App.ComparisonChartEntryProcessed> | undefined;
	let scoreChart: XYContainer<App.ComparisonChartEntryProcessed> | undefined;
	let scoreTooltip: Tooltip | undefined;
	let scoreCrosshair: Crosshair<App.ComparisonChartEntryProcessed> | undefined;

	function resetAccessors() {
		rankY = [];
		scoreY = [];
		scoreColors = [];

		for (const i in data.players) {
			const player = data.players[i];

			rankY.push(d => (player.rankVisible === false ? undefined : d.players[player.id]?.rank));
			scoreY.push(d => (player.scoresVisible === false ? undefined : d.players[player.id]?.scores));
			scoreColors.push(player.color || CHART_COLORS[Number(i) % CHART_COLORS.length]);
		}
	}

$effect(() => {	
	if (data) {
		resetAccessors();
		if (rankChart) initRankChart();
		if (scoreChart) initScoreChart();
	}
});

	function tooltipPlayerHTML(d: App.ComparisonChartEntryProcessed, plrId: string) {
		const plrDataIndex = data.players.findIndex(plr => plr.id == plrId);
		const scores = d.players?.[plrId]?.scores;
		if (!scores || plrDataIndex === -1) return "";
		const rank = d.players[plrId].rank;
		const name = data.players[plrDataIndex].name;
		const color = data.players[plrDataIndex].color ?? "inherit";

		return `<tr>
      <td style="text-align: right;">${name}</td>
      <td><strong style="color: ${color};">#</strong> ${formatNumber(rank, ",")}</td>
      <td><strong style="color: ${color};">${category.substring(3)}</strong> ${formatNumber(scores)}</td>
    </tr>`;
	}

	function tooltipTemplate(
		d: App.ComparisonChartEntryProcessed | undefined,
		x: number | Date,
		data: App.ComparisonChartEntryProcessed[],
		leftNearestDatumIndex?: number
	) {
		if (!d) return "";
		const timestamp = Number(d.date);
		if (isNaN(timestamp)) return "";

		let tooltipString = "<table class='comparison-tooltip-table'><tbody>";
		for (const plrId in d.players) tooltipString += tooltipPlayerHTML(d, plrId);

		return `${tooltipString}
      <tr><td colspan='3' style='text-align: center;'>
        <small style="color: var(--color-active);">${formatDate(new Date(timestamp))}</small>
      </td></tr>
    </tbody>
    </table>`;
	}

	const margin = { left: 62, right: 0, top: 0, bottom: 36 };
	const tickFormatX = (tick: number | Date) => formatDate(new Date(tick));
	const tickFormatY = (tick: number | Date) => formatNumber(Number(tick));

	function destroyRankChart() {
		rankChart?.destroy();
		rankChart = undefined;
	}

	function destroyScoreChart() {
		scoreChart?.destroy();
		scoreChart = undefined;
		scoreTooltip?.destroy();
		scoreTooltip = undefined;
		scoreCrosshair = undefined;
	}

	function initRankChart() {
		if (!rankChartElement || !data?.ranks?.length) return;
		destroyRankChart();

		rankChart = createChartContainer(
			rankChartElement,
			{
				components: [createChartLine({ x, y: rankY, color: rankColors, lineWidth: 4 })],
				yDirection: Direction.South,
				padding: { top: 30, bottom: 30 },
				autoMargin: false,
				margin
			},
			data.ranks
		);
	}

	function initScoreChart() {
		if (!scoreChartElement || !data?.ranks?.length) return;
		destroyScoreChart();

		scoreTooltip = createChartTooltip({
			horizontalShift: 20
		});

		scoreCrosshair = createChartCrosshair<App.ComparisonChartEntryProcessed>({
			x,
			y: scoreY,
			template: tooltipTemplate,
			duration: 0,
			strokeColor: (_data, i) => scoreColors[i],
			strokeWidth: 4,
			color: "var(--color-darkish)",
			tooltip: scoreTooltip
		});

		scoreChart = createChartContainer(
			scoreChartElement,
			{
				components: [createChartLine({ x, y: scoreY, color: (_data, i) => scoreColors[i], lineWidth: 6 })],
				padding: { top: 10, bottom: 10 },
				autoMargin: false,
				xAxis: createChartAxis<App.ComparisonChartEntryProcessed>({
					type: "x",
					gridLine: false,
					domainLine: false,
					tickLine: false,
					tickTextColor: "var(--color-lighter)",
					tickFormat: tickFormatX,
					tickTextFontSize: "14px",
					numTicks: 5,
					position: "bottom"
				}),
				yAxis: createChartAxis<App.ComparisonChartEntryProcessed>({
					type: "y",
					gridLine: true,
					domainLine: false,
					tickLine: false,
					tickTextColor: "var(--color-lighter)",
					tickFormat: tickFormatY,
					tickTextFontSize: "14px",
					numTicks: 5,
					position: "left"
				}),
				tooltip: scoreTooltip,
				crosshair: scoreCrosshair,
				margin
			},
			data.ranks
		);
	}

	onMount(() => {
		initRankChart();
		initScoreChart();

		return () => {
			destroyRankChart();
			destroyScoreChart();
		};
	});
</script>

{#if data?.ranks?.length}
	<div class="player-chart-container chart-ranks" bind:this={rankChartElement}></div>
	<div class="player-chart-container chart-scores" bind:this={scoreChartElement}></div>
{:else}
	<p class="solo-text">No data</p>
{/if}
