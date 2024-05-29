<script lang="ts">
  import { onMount } from "svelte";
  import { PUBLIC_SOCKET_PORT, PUBLIC_SOCKET_URI } from "$env/static/public";
  import ioClient from "socket.io-client";

  const socket = ioClient(PUBLIC_SOCKET_URI);
  console.log(PUBLIC_SOCKET_URI);

  let curCount = 0;
  let localCount = 0;
  const colors = ["0000ff", "ff00ff", "ff0000", "ffff00", "00ff00", "00ffff"];
  let audioElementPoggers: HTMLAudioElement;

  onMount(() => {
    if (localStorage.senko) localCount = localStorage.senko;
    socket.on("senko", (msg) => {
      console.log("client", msg);
    });
  });

  function handleClick() {
    (audioElementPoggers.cloneNode(false) as HTMLAudioElement).play();
    ++curCount;
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
  <div id="counter" class="stroke" style="opacity: {curCount ? 1 : 0}">
    {localCount}
  </div>
  <span class="stroke" id="click-text" style="opacity: {localCount ? 0 : 1};">
    Click me!
  </span>

  <img
    id="senko-clickable"
    src="/senko_poggers.png"
    alt="senko poggers"
    height="256"
    draggable={false}
    on:click|preventDefault={handleClick}
    on:keypress={null}
    on:contextmenu|preventDefault={handleClick}
    style="height: {25 + curCount * 0.5}%;
			top: {75 - curCount * 0.25}%;
			box-shadow: 0 0 2svw 0 #{curCount
      ? colors[(curCount - 1) % colors.length]
      : 'aaa'};"
  />

  <a class="a" href="/home">home</a>
</main>

<style>
  main {
    background-color: var(--color-lightest);
    color: var(--color-dark);
    overflow: hidden;
  }
  a {
    position: fixed;
    bottom: 5%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .stroke {
    text-shadow:
      -1px -1px 0 #fff,
      1px -1px 0 #fff,
      -1px 1px 0 #fff,
      1px 1px 0 #fff;
  }

  #counter,
  #click-text {
    transition: opacity 1s;
    position: fixed;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  }
  #counter {
    top: 5%;
  }
  #click-text {
    top: 15%;
  }
  #senko-clickable {
    transition:
      height 0.1s ease,
      box-shadow 0.2s ease;
  }
</style>
