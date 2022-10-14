<script lang="ts">
	export let href: string;
	export let label: string;
	export let backgroundColor: string;
	export let backgroundImage: string;
</script>

<div class="btn-menu-main">
	<a {href}>
		<div
			class="btn-menu"
			style="background-color: {backgroundColor}; background-image: {backgroundImage};"
		/>
		<div class="btn-menu-label">{label}</div>
	</a>
</div>

<style>
	.btn-menu-main {
		box-shadow: 0 0 14px 0 #666;
		background-color: var(--color-lighter);
		background-position: center;
		min-width: 256px;
		height: fit-content;
		flex: 1;
		transition: transform 0.3s ease;
	}
	.btn-menu-main a {
		text-decoration: none;
		color: var(--color-darkest);
		font-weight: 700;
		font-size: 1.125rem;
		transition: color 0.3s;
	}
	.btn-menu {
		padding: 100px 100px;
		background-size: cover;
		background-repeat: no-repeat;
		background-position-x: center;
	}
	.btn-menu-label {
		padding: 0.75rem;
		text-align: right;
	}

	.btn-menu-main:hover {
		transform: translateY(-9px);
	}
	.btn-menu-main:hover a {
		color: #666;
	}
</style>
