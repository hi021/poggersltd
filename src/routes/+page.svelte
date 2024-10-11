<script lang="ts">
  import { onMount } from "svelte";
  import { PUBLIC_SOCKET_URI } from "$env/static/public";
  import { formatNumber, tooltip } from "$lib/util";
  import ioClient from "socket.io-client";

  const socket = ioClient(PUBLIC_SOCKET_URI);

  let sessionCount = 0;
  let localCount = 0;
  //   let globalCount = 0;
  let height = 0;
  let shadowColor = "#aaa";
  const colors = ["2233ee", "ee22ee", "ee2233", "eeee22", "22ee33", "22eeee"];
  let audioElementPoggers: HTMLAudioElement;

  $: height = 20 + sessionCount * 0.5;
  $: shadowColor = "#" + (sessionCount ? colors[(sessionCount - 1) % colors.length] : "aaa");

  onMount(() => {
    if (localStorage.senko) localCount = localStorage.senko;
    socket.on("senko", (msg) => {
      console.log("client", msg);
    });
  });

  function handleClick() {
    const audio = audioElementPoggers.cloneNode(false) as HTMLAudioElement;
    audio.volume = 0.675;
    audio.play();

    ++sessionCount;
    ++localCount;
    localStorage.senko = localCount;
    socket.emit("senko", { add: 1 });
  }
</script>

<svelte:head>
  <title>poggers</title>
</svelte:head>

<audio src="/poggers.mp3" bind:this={audioElementPoggers} />

<main class="flex-center flex-fill">
  <span
    id="counter"
    class="stroke"
    style="opacity: {sessionCount ? 1 : 0};"
    use:tooltip={{ content: "Your total senkos" }}>
    {formatNumber(localCount)}
  </span>
  <span id="click-text" class="stroke" style="opacity: {localCount ? 0 : 1};"> Click me! </span>
  <span id="counter-global" class="stroke" style="opacity: {sessionCount ? 0.6 : 0};"
    >{localCount}</span>

  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <img
    id="senko-clickable"
    class="unselectable"
    draggable="false"
    src="/senko_poggers.png"
    alt="senko says poggers"
    height="256"
    on:keypress={() => false}
    on:click|preventDefault={handleClick}
    on:contextmenu|preventDefault={handleClick}
    style="height: {height}%; box-shadow: 0 0 2svw 1px {shadowColor};" />

  <a class="a stroke" href="/home" draggable="false">home</a>
</main>

<style>
  main {
    background-color: var(--color-lightest);
    color: var(--color-dark);
    overflow: hidden;
    user-select: none;
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
    border-radius: 12px;
    transition:
      height 0.125s ease,
      width 0.125s ease,
      box-shadow 0.125s ease;
    z-index: 1;
  }
</style>
