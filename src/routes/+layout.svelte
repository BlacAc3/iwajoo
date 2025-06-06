<script>
    let { children } = $props();
    import "../app.css";
    import { Confetti } from "svelte-confetti";
    import { onMount } from "svelte";

    let showConfetti = $state(false);

    // Function to trigger confetti
    const triggerConfetti = () => {
        showConfetti = true;
        // Automatically hide confetti after 3 seconds
        setTimeout(() => {
            showConfetti = false;
        }, 7000); // 3000 milliseconds = 3 seconds
    };

    // Optional: Trigger confetti when the component mounts
    // onMount(() => {
    //     triggerConfetti();
    // });
    triggerConfetti();
</script>

{#if showConfetti}
    <Confetti
        class="confetti-container"
        x={[-20, 20]}
        y={[0.1, 0.1]}
        delay={[500, 2000]}
        duration="7000"
        amount="400"
        fallDistance="100vh"
    />
{/if}

<nav class="border-b-0 bg-blue-100 shadow-lg">
    <div class="p-6 px-18 text-2xl md:px-8 font-bold text-blue-800">Iwajoo</div>
</nav>

{@render children()}

<style>
    :global(.confetti-container) {
        position: fixed;
        top: -80px;
        left: 0;
        height: 100vh;
        width: 100%;
        display: flex;
        justify-content: center;
        overflow: hidden;
        pointer-events: none;
        z-index: 9999;
    }
</style>
