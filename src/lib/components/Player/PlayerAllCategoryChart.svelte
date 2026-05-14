<script lang="ts">
	import { onMount } from "svelte";
	import {
		createChartContainer,
		createChartStackedBar,
		createChartTooltip,
		formatNumber,
		getDaysBetweenStringFormattedDates,
		parseCategoryNumber
	} from "$lib/util";
	import { Direction, Orientation, StackedBar, Tooltip, XYContainer } from "@unovis/ts";
	import { CATEGORY_COLORS, SCORE_CATEGORIES } from "$lib/constants";
	import type { PageData } from "../../../routes/(navgroup)/osu/player/[idOrName]/[[category]]/$types";

	interface Props {
		data: PageData;
		forceVisible?: boolean;
	}
	type ChartData = {
		[category in App.RankingCategory]: { total: number; normalized: number };
	};

	let { data, forceVisible }: Props = $props();
	let enoughDataToRender = $derived(isEnoughDataToRender());
	let chartData = $derived(convertCategoryData(data));
	let tooltipData = $derived(getTooltipData(chartData));

	let chartElement = $state<HTMLElement>();
	let chart: XYContainer<ChartData> | undefined;
	let chartTooltip: Tooltip | undefined;

	function removeOutdatedCategories(data: PageData) {
		let mostRecentDate = "";
		for (const category of SCORE_CATEGORIES) {
			const categoryData = data[category];
			if (!categoryData) continue;

			const date = categoryData.date;
			if (!mostRecentDate || mostRecentDate < date) mostRecentDate = date;
		}

		for (const category of SCORE_CATEGORIES) {
			const categoryData = data[category];
			if (!categoryData) continue;

			const date = categoryData.date;
			if (getDaysBetweenStringFormattedDates(date, mostRecentDate) > 3) delete data[category];
		}
	}

	function isEnoughDataToRender() {
		if (forceVisible) return true;
		removeOutdatedCategories(data);

		let fitCategoryCount = 0;
		for (const category of SCORE_CATEGORIES) {
			const categoryData = data[category];
			if (categoryData?.scores) ++fitCategoryCount;
		}

		return fitCategoryCount >= 2;
	}

	function convertCategoryData(data: PageData) {
		const convertedData: ChartData[] = [];
		if (!enoughDataToRender) return convertedData;

		let previousCategory;
		for (const category of SCORE_CATEGORIES.toReversed()) {
			const categoryData = data[category];
			if (!categoryData) continue;

			convertedData[0] = {
				...(convertedData[0] ?? {}),
				[category]: {
					total: categoryData.scores,
					normalized: categoryData.scores - (data[previousCategory as App.RankingCategory]?.scores ?? 0)
				}
			};
			previousCategory = category;
		}

		return convertedData;
	}

	function getTooltipData(data: ChartData[]) {
		let maxScores = 0;
		const tooltipCategories: string[] = [];
		const tooltipScores: string[] = [];
		const tooltipRatios: string[] = [];

		for (const categoryString of SCORE_CATEGORIES) {
			const category = categoryString as App.RankingCategory;
			const categoryData = data[0]?.[category];
			if (!categoryData) continue;

			const scores = categoryData.total;
			if (!maxScores) maxScores = scores;

			tooltipCategories.push(`<td>Top ${parseCategoryNumber(category)}</td>`);
			tooltipScores.push(`<td style="color: ${CATEGORY_COLORS[category]}">${formatNumber(scores)}</td>`);
			tooltipRatios.push(`<td><small>${Math.round((scores / maxScores) * 10000) / 100}%</small></td>`);
		}

		return {
			categories: tooltipCategories.join(""),
			scores: tooltipScores.join(""),
			ratios: tooltipRatios.join("")
		};
	}

	const x = (d: ChartData, i: number) => i;
	const y = SCORE_CATEGORIES.map(category => (d: ChartData) => d[category].normalized);

	function tooltipTemplate() {
		return `<table class="player-all-chart-tooltip-table">
       <tbody>
        <tr>${tooltipData.categories}</tr>
        <tr>${tooltipData.scores}</tr>
        <tr>${tooltipData.ratios}</tr>
       </tbody>
    </table>`;
	}

	function destroyChart() {
		chart?.destroy();
		chart = undefined;
		chartTooltip?.destroy();
		chartTooltip = undefined;
	}

	function initChart() {
		if (!chartElement || !enoughDataToRender || chartData.length === 0) return;
		destroyChart();

		chartTooltip = createChartTooltip({
			triggers: { [StackedBar.selectors.bar]: tooltipTemplate },
			verticalPlacement: "bottom",
			verticalShift: 30
		});

		chart = createChartContainer(
			chartElement,
			{
				components: [
					createChartStackedBar({
						x,
						y,
						orientation: Orientation.Horizontal,
						color: (d: ChartData, i: number) => CATEGORY_COLORS[SCORE_CATEGORIES[i]]
					})
				],
				tooltip: chartTooltip,
				height: 50,
				yDirection: Direction.South
			},
			chartData
		);
	}

	onMount(() => {
		initChart();
		return destroyChart;
	});

	$effect(() => {
		if (chartElement) initChart();
	});
</script>

{#if enoughDataToRender}
	<div class="player-all-chart-wrapper">
		<div class="player-all-chart" bind:this={chartElement}></div>
	</div>
{/if}

<style>
	.player-all-chart-wrapper {
		width: clamp(480px, 50%, 100%);
		margin: 20px auto 0 auto;
		border-radius: 12px;
		overflow: hidden;
	}

	:global(.player-all-chart-tooltip-table) {
		border-spacing: 10px 2px;
	}
	:global(.player-all-chart-tooltip-table td) {
		text-align: center;
	}
</style>
