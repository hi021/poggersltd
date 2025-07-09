<script lang="ts">
  import { animate, formatNumber, tooltip } from "$lib/util";
  import { PUBLIC_SOCKET_PORT } from "$env/static/public";
  import { onDestroy, onMount } from "svelte";
  import { expoInOut } from "svelte/easing";
  import { fade } from "svelte/transition";
  import { io } from "socket.io-client";

  const socket = io(`http://localhost:${PUBLIC_SOCKET_PORT}`);
  socket.on("senko-count", (senkos) => {
    globalInitialized = true;
    globalCount = globalCountAnimated;
    const difference = senkos - globalCount;
    if (!difference) return;

    animate({
      duration: 200,
      timing: expoInOut,
      draw: (progress) => (globalCountAnimated = Math.ceil(globalCount + difference * progress))
    });
  });

  let sessionCount = 0;
  let localCount = 0;
  let globalCount = 0;
  let globalCountAnimated = 0;
  let globalInitialized = false;
  let senkoDimension = 20;
  let shadowColor = "#aaa";
  const colors = ["2233ee", "ee22ee", "ee2233", "eeee22", "22ee33", "22eeee"];
  let audioElementPoggers: HTMLAudioElement;
  let mainDivElement: HTMLElement;

  $: senkoDimension = 20 + sessionCount * 0.5;
  $: shadowColor = "#" + (sessionCount ? colors[(sessionCount - 1) % colors.length] : "aaa");

  onMount(() => {
    if (localStorage.senko) localCount = localStorage.senko;
    socket.emit("senko-get");
  });

  onDestroy(() => socket.disconnect());

  function handleClick() {
    const audio = audioElementPoggers.cloneNode(false) as HTMLAudioElement;
    audio.volume = 0.42;
    audio.play();

    ++sessionCount;
    ++globalCount;
    ++globalCountAnimated;
    localStorage.senko = ++localCount;
    socket.emit("senko-add", 1);

    if (sessionCount % 5 == 2) spawnBackgroundPog();
  }

  function spawnBackgroundPog() {
    if (!mainDivElement) return;

    const fallDuration = `${Math.random() * 0.55 + 0.75}s`;
    const rotation = `${Math.random() * 90 - 45}deg`;
    const label = Math.random() > 0.5 ? "POG" : "pog";
    const x = `${Math.random() * 95 + 5}%`;
    const pog = document.createElement("span");
    pog.style.animationDuration = fallDuration;
    pog.style.rotate = rotation;
    pog.style.left = x;
    pog.onanimationend = () => pog.remove();
    pog.textContent = label;
    pog.ariaHidden = "true";
    pog.className = "background-pog";

    mainDivElement.appendChild(pog);
  }

  const blurOnFocus = (e: FocusEvent) => (e.target as HTMLElement).blur();
</script>

<svelte:head>
  <title>poggers</title>
</svelte:head>

<audio src="/poggers.mp3" bind:this={audioElementPoggers}></audio>

<main class="flex-center flex-fill unselectable" bind:this={mainDivElement}>
  {#if sessionCount}
    <span
      id="counter"
      class="stroke"
      aria-label="Your total senkos"
      use:tooltip={{ content: "Your total senkos" }}
      transition:fade={{ duration: 1000 }}>
      {formatNumber(localCount)}
    </span>
  {/if}
  <span
    id="click-text"
    class="stroke"
    style="opacity: {localCount ? 0 : 1};"
    aria-hidden={localCount ? "true" : "false"}>
    Click me!
  </span>
  <span
    id="counter-global"
    class="stroke"
    style="opacity: {globalInitialized && sessionCount ? 0.6 : 0};"
    aria-hidden="true">{globalCountAnimated}</span>

  <button
    type="button"
    aria-label="senko"
    id="senko-clickable"
    class="unselectable"
    draggable="false"
    tabindex="-1"
    on:focus={blurOnFocus}
    on:click|preventDefault={handleClick}
    on:contextmenu|preventDefault={handleClick}
    style="height: {senkoDimension}%; box-shadow: 0 0 2svw 1px {shadowColor};"></button>

  <a class="a stroke" href="/home" draggable="false">home</a>
</main>

<style>
  main {
    position: relative;
    background-color: var(--color-lightest);
    color: var(--color-dark);
    overflow: hidden;
  }

  .stroke {
    text-shadow:
      -1px -1px 0 #fff,
      1px -1px 0 #fff,
      -1px 1px 0 #fff,
      1px 1px 0 #fff;
  }

  #counter,
  #counter-global,
  #click-text,
  a {
    position: fixed;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: opacity 1s;
    z-index: 2;
  }
  a {
    bottom: 5%;
  }
  #counter {
    cursor: default;
    top: 5%;
  }
  #click-text {
    top: 15%;
  }
  #counter-global {
    font-size: 3.5rem;
    font-style: italic;
    font-weight: 900;
    letter-spacing: 10svw;
    color: var(--color-darkish);
    pointer-events: none;
    transform: translate(calc(-50% + 5svw), -50%);
  }

  #senko-clickable {
    height: 256px;
    aspect-ratio: 1/1;
    border-radius: 12px;
    background-image: url("/senko_poggers.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    transition:
      height 0.125s ease,
      width 0.125s ease,
      box-shadow 0.125s ease;
    z-index: 1;
  }

  :global(.background-pog) {
    position: absolute;
    font-size: 2.75rem;
    font-weight: 700;
    background: linear-gradient(75deg, var(--color-dark), var(--color-pink), var(--color-dark));
    -webkit-background-clip: text;
    -moz-background-clip: text;
    background-clip: text;
    outline-color: transparent;
    color: transparent;
    text-shadow: 0px 0px 0 rgba(255, 255, 255, 0.6);
    opacity: 0.5;
    animation: pog-gravity 1s ease-in-out;
    pointer-events: none;
    overflow: hidden;
    z-index: 1;
  }
  @keyframes pog-gravity {
    0% {
      top: -10%;
    }
    100% {
      top: 110%;
    }
  }
</style>
