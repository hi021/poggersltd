<slot />

<style global>
	@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600&display=swap');
	:root {
		--color-darkest: #111;
		--color-darker: #272727;
		--color-dark: #3e3e3e;
		--color-darkish: #505050;

		--color-lightest: #eee;
		--color-lighter: #d8d8d8;
		--color-light: #c1c1c1;

		--color-active: #b39ddb;
		--color-active-dark: #6a1b9a;
		--color-purple: #4a148c;

		/* Buttons */
		--clr-blue: 210, 79%, 46%;
		--clr-green: 123, 43%, 39%;
		--clr-red: 354, 79%, 46%;
		--clr-yellow: 53, 84%, 60%;
		--clr-gray: 0, 0%, 58%;
		/* --clr-lightgray: 0, 0%, 44%; */

		--clr-blue-h: 210, 79%, 56%;
		--clr-green-h: 123, 43%, 49%;
		--clr-red-h: 354, 79%, 56%;
		--clr-yellow-h: 55, 100%, 74%;
		--clr-gray-h: 0, 0%, 68%;
		/* --clr-lightgray-h: 0, 0%, 54%; */
		/* Buttons */
	}
	html,
	body {
		min-height: 100vh;
	}
	body {
		/* flex so we can use flex-fill on the container div in app.html */
		display: flex;
		margin: 0;
		background-color: var(--color-darker);
		color: var(--color-lighter);

		font-family: 'Noto Sans', 'Segoe UI', 'Roboto', 'Oxygen', 'Cantarell', 'Helvetica Neue',
			'Ubuntu', sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	/* INPUTS */
	button,
	input,
	select,
	textarea {
		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
	}
	input,
	select,
	textarea {
		margin-bottom: 0;
		padding: 4px;
		border-radius: 0.25rem;
		font-weight: 400;
		color: #495057;
		background-color: #fff;
		-webkit-background-clip: padding-box;
		background-clip: padding-box;
		border: 1px solid #ced4da;
		transition: border-color 0.1s ease-in-out, box-shadow 0.1s ease-in-out;
	}
	/* can't use :is() in global sheets;; */
	input:focus,
	select:focus,
	textarea:focus {
		border-color: #80bdff;
		outline: 0;
		box-shadow: 0 0 0 0.15rem rgba(0, 123, 255, 0.25);
	}
	input[disabled],
	select[disabled],
	textarea[disabled] {
		background-color: #ccc;
	}
	textarea {
		max-height: 40%;
		min-height: 1rem;
		min-width: 10ch;
	}

	fieldset {
		border: 1px solid rgba(0, 0, 0, 0.25);
		border-radius: 3px;
	}

	.input-dark {
		font-size: 1.375rem;
		background-color: var(--color-dark);
		border: none;
		color: var(--color-lighter);
		padding: 8px 6px;
		border-radius: 0;
	}

	/* BUTTONS */
	button {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		--clr: var(--clr-gray);
		color: var(--color-darkest);
		text-decoration: none;
		font-size: 1rem;
		border: 1px solid var(--color-darkest);
		border-radius: 0.4rem;
		background-color: hsl(var(--clr));
		border-color: hsl(var(--clr));
		padding: 0.375rem 0.75rem;
		margin: 0;
		-webkit-user-select: none;
		user-select: none;
		transition: background-color 0.2s, border-color 0.1s ease-in-out, box-shadow 0.1s ease-in-out;
		cursor: pointer;
	}
	button:focus {
		outline: 0;
		box-shadow: 0 0 0 0.15rem hsla(var(--clr), 0.5);
	}
	button[disabled] {
		opacity: 0.55;
		cursor: default !important;
	}

	.btn-small {
		font-size: 0.75em;
		padding: 0.15rem 0.35rem;
	}
	.btn-none {
		padding: 0;
		border: none;
		background: none;
		outline: none;
	}
	.btn-rect {
		border-radius: 0;
	}
	.btn-blue {
		--clr: var(--clr-blue);
		color: var(--color-lightest);
	}
	.btn-blue:not([disabled]):hover {
		background-color: hsl(var(--clr-blue-h));
	}
	.btn-green {
		--clr: var(--clr-green);
		color: var(--color-lightest);
	}
	.btn-green:not([disabled]):hover {
		background-color: hsl(var(--clr-green-h));
	}
	.btn-gray {
		--clr: var(--clr-gray);
		color: var(--color-darkest);
	}
	.btn-gray:not([disabled]):hover {
		background-color: hsl(var(--clr-gray-h));
	}
	.btn-red {
		--clr: var(--clr-red);
		color: var(--color-lightest);
	}
	.btn-red:not([disabled]):hover {
		background-color: hsl(var(--clr-red-h));
	}
	.btn-yellow {
		--clr: var(--clr-yellow);
		color: var(--color-darkest);
	}
	.btn-yellow:not([disabled]):hover {
		background-color: hsl(var(--clr-yellow-h));
	}
	/* BUTTONS */
	/* INPUTS */

	/* ICONS */
	.icon {
		display: inline-block;
		aspect-ratio: 1/1;
		background-size: contain;
		background-origin: content-box;
		background-repeat: no-repeat;
		background-position: center;
	}
	.icon.disabled {
		opacity: 0.5;
		cursor: default;
	}

	.icon-search {
		background-image: url('/icons/search.svg');
	}
	/* ICONS */

	/* OSU */
	.osu-flag-small {
		height: 24px;
		aspect-ratio: 4/3;
		border-radius: 4px;
	}
	.osu-avatar-small {
		height: 36px;
		aspect-ratio: 1/1;
		border-radius: 10px;
	}
	/* player badge in ranking */
	.osu-badge {
		height: 26px;
		margin-left: 8px;
	}

	/* TABLE */
	.osu-main {
		background: linear-gradient(transparent 0%, rgba(49, 27, 146, 0.125) 85%);
	}

	.osu-table {
		width: 100%;
		border-spacing: 0 2px;
		padding: 0 2.5%;
		margin: 16px 0;
	}
	.osu-table tr {
		background-color: rgba(0, 0, 0, 0.2);
		transition: background-color 0.25s;
	}
	.osu-table tr.top-rank {
		background-image: url('/osu_triangles.svg');
		/* background-size: 50%; */
		background-size: cover;
	}
	.osu-table tr:hover {
		background-color: rgba(100, 180, 245, 0.2);
	}
	.osu-table td {
		line-height: 1;
	}
	.osu-table td:first-child {
		padding-left: 10px;
	}
	.osu-table td:last-child {
		padding-right: 10px;
	}

	.osu-name-column {
		cursor: pointer;
	}
	.osu-name-column > div {
		align-items: center;
	}
	.osu-name-column:hover > div > span {
		color: var(--color-active);
	}
	/* TABLE */

	/* ARROWS */
	/* 18x12 px */
	.arrow,
	.arrow-down {
		width: 0;
		height: 0;
		padding: 0;
		border-left: 9px solid transparent;
		border-right: 9px solid transparent;
	}
	.arrow {
		border-bottom: 11px solid hsl(110, 60%, 45%);
	}
	.arrow-down {
		transform: rotate(180deg);
		border-bottom: 11px solid hsl(0, 60%, 50%);
	}
	.line {
		width: 18px;
		height: 3px;
		background-color: hsl(0, 0%, 50%);
	}
	.circle {
		width: 11px;
		height: 11px;
		border-radius: 50%;
		background-color: hsl(207, 60%, 50%);
	}
	/* ARROWS */
	/* OSU */

	/* SECONDARY NAV */
	.secondary-nav {
		background: linear-gradient(var(--color-darker) 0%, var(--color-dark) 15%);
		justify-content: space-between;
		padding: 0 20px;
		margin-bottom: 16px;
		font-size: 0.825rem;
	}
	.secondary-nav-tab {
		padding: 8px 12px;
		cursor: pointer;
		color: var(--color-light);
	}
	.secondary-nav-tab.active {
		color: var(--color-active);
	}
	.secondary-nav-tab:hover,
	.secondary-nav-tab:focus,
	.secondary-nav-tab:focus-visible {
		outline: none;
		color: #fff;
	}
	/* SECONDARY NAV */

	/* SCROLLBAR */
	.scrollbar-dark,
	.scrollbar-small {
		scrollbar-color: #222 var(--color-dark);
	}
	/* apparently something must be in here for other styles to work */
	.scrollbar-dark::-webkit-scrollbar,
	.scrollbar-small::-webkit-scrollbar {
		display: initial;
	}
	.scrollbar-dark::-webkit-scrollbar-track {
		background: var(--color-dark);
	}
	.scrollbar-dark::-webkit-scrollbar-thumb {
		background: #222;
	}
	.scrollbar-dark::-webkit-scrollbar-thumb:hover {
		background: #333;
	}
	.scrollbar-dark::-webkit-scrollbar-button,
	.scrollbar-small::-webkit-scrollbar-button {
		display: none;
	}

	.scrollbar-small::-webkit-scrollbar {
		width: 10px;
		height: 10px;
	}
	.scrollbar-small::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 999px;
	}
	.scrollbar-small::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.3);
		border-radius: 999px;
	}
	.scrollbar-small::-webkit-scrollbar-thumb:hover {
		background: rgba(0, 0, 0, 0.4);
	}
	/* SCROLLBAR */

	/* LOGO RAINBOW */
	.logo-text {
		color: inherit;
		text-decoration: none;
		padding: 0 20px;
	}
	.logo-text:hover,
	.logo-text:focus,
	.logo-text:focus-visible {
		background: linear-gradient(
			125deg,
			#ff2400,
			#e81d1d,
			#e8b71d,
			#e3e81d,
			#1de840,
			#1ddde8,
			#2b1de8,
			#dd00f3,
			#dd00f3,
			#2b1de8,
			#1ddde8,
			#1de840,
			#e3e81d,
			#e8b71d,
			#e81d1d,
			#ff2400
		);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		outline: 0;
		text-shadow: 2px 2px 0 rgba(255, 255, 255, 0.2);
		animation: logo-rainbow 7s linear infinite alternate;
		background-size: 250% 100%;
	}

	@keyframes logo-rainbow {
		0% {
			background-position: 0 50%;
		}
		100% {
			background-position: 100% 50%;
		}
	}
	/* LOGO RAINBOW */

	/* MISC */
	.row {
		display: flex;
		flex-direction: row;
	}
	.column {
		display: flex;
		flex-direction: column;
	}
	.flex-center {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.flex-fill {
		display: flex;
		flex: 1 1 auto;
	}

	.group > * {
		border-radius: 0;
	}
	.group > *:first-child {
		border-top-left-radius: 4px;
		border-bottom-left-radius: 4px;
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}
	.group > *:last-child {
		border-top-right-radius: 4px;
		border-bottom-right-radius: 4px;
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	}

	.a {
		color: inherit;
		text-decoration: none;
	}
	.a:hover {
		text-decoration: underline;
	}

	.unselectable {
		-webkit-user-select: none;
		user-select: none;
		-webkit-user-drag: none;
	}

	.noscroll {
		height: 100% !important;
		overflow: hidden !important;
	}

	.clip-text {
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	.overlay {
		--color-base: 255, 255, 255;
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		top: 0;
		background-color: rgba(var(--color-base), 0.3);
		z-index: 5;
	}

	.solo-text {
		margin: 2.5rem auto;
		font-size: 1.75rem;
		text-align: center;
	}
	/* MISC */

	/* MEDIA */
	@media screen and (max-width: 1280px) {
	}
	@media screen and (max-width: 640px) {
		.hide-width-640 {
			display: none;
		}
		.column-width-640 {
			flex-direction: column;
		}
	}
	/* MEDIA */
</style>
