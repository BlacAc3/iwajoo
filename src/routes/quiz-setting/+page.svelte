<script>
    import { onMount } from "svelte";
    import {
        MoveLeft,
        Brain,
        Shield,
        Check,
        Clock,
        Infinity,
    } from "@lucide/svelte";

    // State variable to track the selected mode ('classic' or 'compliance')
    let selectedMode = "classic"; // Default to classic

    // State variable to track the selected timing ('timed' or 'free')
    let selectedTiming = "timed"; // Default to timed

    // State variable to track if the back button should be fixed
    let isFixed = false; // Default to relative initially

    // Reference to the back button element
    let backButton;
    // Variable to store the original top position relative to the document
    let originalOffsetTop = 0;

    // Function to handle mode selection
    function selectMode(mode) {
        selectedMode = mode;
    }

    // Function to handle timing selection
    function selectTiming(timing) {
        selectedTiming = timing;
    }

    // Function to handle scroll event
    function handleScroll() {
        if (!backButton) return; // Ensure element exists

        // Calculate originalOffsetTop the first time the scroll handler runs
        // after the element is rendered and available via bind:this.
        // This makes the initial position calculation more robust.
        if (originalOffsetTop === 0) {
            originalOffsetTop =
                backButton.getBoundingClientRect().top + window.scrollY;
        }

        // The button should be fixed when the user scrolls down past its original position
        // such that its original top would be at or above the desired fixed position (top-5, which is 20px).
        // It should be relative otherwise.
        // The threshold is calculated as originalOffsetTop minus the desired fixed 'top' value (20px for top-5).
        const fixedThreshold = originalOffsetTop - 20;

        isFixed = window.scrollY >= fixedThreshold;
    }

    onMount(() => {
        // Add the scroll listener
        window.addEventListener("scroll", handleScroll);

        // Call handleScroll once immediately to calculate originalOffsetTop
        // and set the initial isFixed state based on current scroll position.
        // Use requestAnimationFrame to ensure bind:this={backButton} is available
        // and its initial position is correctly calculated after render.
        requestAnimationFrame(() => {
            handleScroll();
        });

        // Cleanup the event listener when the component is destroyed
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    });
</script>

<div
    class="min-h-screen bg-gray-300 pb-10 flex flex-col items-center text-gray-800"
>
    <a
        bind:this={backButton}
        class="{isFixed
            ? 'fixed top-5 left-4 md:left-20 z-50'
            : 'relative mt-5 ml-4 md:ml-20'} flex self-start p-2 hover:shadow-xl transition duration-300 border border-gray-300 bg-blue-300 rounded-lg w-fit gap-2 text-gray-700 hover:text-blue-600"
        href="/"
    >
        <MoveLeft class="w-5 h-5" />
        <p class="text-sm font-medium">Back to Home</p>
    </a>
    <div
        class="max-w-4xl mx-auto bg-gray-100 border-0 border-gray-100 p-6 sm:p-8 rounded-xl shadow-2xl mt-5 w-full"
    >
        <h2 class="text-2xl sm:text-3xl font-bold mb-4 text-center">
            Choose your quiz experience
        </h2>
        <p
            class="text-base sm:text-lg text-gray-600 mb-8 md:mb-10 text-center max-w-2xl mx-auto"
        >
            Select how you want to experience your privacy knowledge challenge
            before we begin!
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <button
                class="border rounded-xl p-6 flex flex-col items-start text-center shadow-sm hover:shadow-md transition duration-300 cursor-pointer relative overflow-hidden
                {selectedMode !== 'classic'
                    ? 'opacity-90 border-gray-300 bg-gray-100'
                    : 'opacity-100 bg-blue-100 border-blue-700'}"
                on:click={() => selectMode("classic")}
                style={selectedMode === "classic"
                    ? "background-image: radial-gradient(circle, rgba(96, 165, 250, 0.6) 1.5px, transparent 1.5px); background-size: 15px 15px; "
                    : ""}
            >
                <div
                    class="rounded-full w-16 h-16 flex self-center items-center justify-center mb-4 transition duration-300
                    {selectedMode === 'classic'
                        ? 'bg-blue-500 opacity-100'
                        : 'bg-blue-300 opacity-75'}"
                >
                    <Brain class="w-10 h-10 text-white" />
                </div>
                <h2 class="text-2xl font-semibold mb-3">Classic Mode</h2>
                <ul class="text-gray-700 text-left mb-6 space-y-2">
                    <li class="flex items-center gap-2">
                        <Check class="w-5 h-5 text-blue-500" />Fun, Playful
                        Experience
                    </li>
                    <li class="flex items-center gap-2">
                        <Check class="w-5 h-5 text-blue-500" />Perfect for
                        Casual learning
                    </li>
                </ul>
                {#if selectedMode === "classic"}
                    <div
                        class="self-center bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full"
                    >
                        Popular choice
                    </div>
                {/if}
            </button>
            <button
                class="border rounded-xl p-6 flex flex-col items-start text-center shadow-sm hover:shadow-md transition duration-300 cursor-pointer relative overflow-hidden
                {selectedMode !== 'compliance'
                    ? 'opacity-90 border-gray-300 bg-gray-100'
                    : 'opacity-100 bg-blue-100 border-blue-700'}"
                on:click={() => selectMode("compliance")}
                style={selectedMode === "compliance"
                    ? "background-image: radial-gradient(circle, rgba(96, 165, 250, 0.6) 1.5px, transparent 1.5px); background-size: 20px 20px; "
                    : ""}
            >
                <div
                    class="rounded-full w-16 h-16 flex self-center items-center justify-center mb-4 transition duration-300
                    {selectedMode === 'compliance'
                        ? 'bg-blue-500 opacity-100'
                        : 'bg-blue-300 opacity-75'}"
                >
                    <Shield class="w-10 h-10 text-white" />
                </div>
                <h2 class="text-2xl font-semibold mb-3">Compliance Track</h2>
                <ul class="text-gray-700 text-left mb-6 space-y-2">
                    <li class="flex items-center gap-2">
                        <Check class="w-5 h-5 text-green-500" />Serious
                        professional choice
                    </li>
                    <li class="flex items-center gap-2">
                        <Check class="w-5 h-5 text-green-500" />Detailed
                        explanation of answers
                    </li>
                </ul>
                {#if selectedMode === "compliance"}
                    <div
                        class="self-center bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full"
                    >
                        Professional choice
                    </div>
                {/if}
            </button>
        </div>
    </div>

    <div
        class="max-w-4xl mx-auto bg-gray-100 border-0 border-gray-100 p-6 sm:p-8 rounded-xl shadow-2xl mt-8 w-full"
    >
        <h2 class="text-2xl sm:text-3xl font-bold mb-4 text-center">
            Choose timing
        </h2>
        <p
            class="text-base sm:text-lg text-gray-600 mb-8 md:mb-10 text-center max-w-2xl mx-auto"
        >
            Decide whether you want to tackle the questions under pressure or
            learn at a relaxed pace.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <button
                class="border rounded-xl p-6 flex gap-3 items-start shadow-sm hover:shadow-md transition h-fit duration-300 cursor-pointer relative overflow-hidden
                    {selectedTiming !== 'timed'
                    ? 'opacity-90 border-gray-300 bg-gray-100'
                    : 'opacity-100 bg-blue-100 border-blue-700'}"
                on:click={() => selectTiming("timed")}
            >
                <div
                    class="rounded-full w-14 h-14 flex-shrink-0 flex items-center justify-center transition duration-300
                        {selectedTiming === 'timed'
                        ? 'bg-blue-500 opacity-100'
                        : 'bg-blue-300 opacity-75'}"
                >
                    <Clock class="w-8 h-8 text-white" />
                </div>
                <div class="flex flex-col gap-1">
                    <h3 class="text-2xl font-semibold text-left">Timed Quiz</h3>
                    <p class="text-gray-700 text-left">
                        Time limit per question.
                    </p>
                </div>
            </button>
            <button
                class="border rounded-xl p-6 flex gap-3 items-start shadow-sm hover:shadow-md transition h-fit duration-300 cursor-pointer relative overflow-hidden
                    {selectedTiming !== 'free'
                    ? 'opacity-90 border-gray-300 bg-gray-100'
                    : 'opacity-100 bg-blue-100 border-blue-700'}"
                on:click={() => selectTiming("free")}
            >
                <div
                    class="rounded-full w-14 h-14 flex-shrink-0 flex items-center justify-center transition duration-300
                        {selectedTiming === 'free'
                        ? 'bg-blue-500 opacity-100'
                        : 'bg-blue-300 opacity-75'}"
                >
                    <Infinity class="w-8 h-8 text-white" />
                </div>
                <div class="flex flex-col gap-1">
                    <h3 class="text-2xl font-semibold text-left">Free Mode</h3>
                    <p class="text-gray-700 text-left">
                        No time limit, learn at your pace.
                    </p>
                </div>
            </button>
        </div>
    </div>

    <button
        class="mt-10 px-6 py-3 sm:px-8 sm:py-4 bg-blue-600 text-white text-lg sm:text-xl font-bold rounded-xl shadow-lg hover:bg-blue-700 transition duration-300"
    >
        Start Quiz
    </button>
</div>
