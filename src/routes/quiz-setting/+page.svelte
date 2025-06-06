<script>
    import { onMount, onDestroy } from "svelte"; // Import lifecycle functions
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

        // The button should be fixed when the user scrolls down past its original position
        // such that its original top would be at or above the desired fixed position (top-5, which is 20px).
        // It should be relative otherwise.
        // We become fixed when window.scrollY is greater than or equal to the originalOffsetTop minus the fixed 'top' value (5px from top-5, which translates to 20px margin).
        // Let's use a threshold around the element's initial top margin. The original class 'mt-5' adds 20px margin.
        // So, its original top position is likely 20px + some parent offset. originalOffsetTop captures this.
        // It should become fixed when window.scrollY exceeds its original position minus the fixed offset (20px).
        const fixedThreshold = originalOffsetTop - 20; // Compare scrollY to the point where the element's original top would be at the fixed position's top

        isFixed = window.scrollY >= fixedThreshold;
    }

    onMount(() => {
        // Calculate originalOffsetTop when the element is in its natural (relative) position.
        // We need to ensure the element is rendered before calculating.
        // Using requestAnimationFrame ensures the DOM is updated after potential initial render.
        requestAnimationFrame(() => {
            if (backButton) {
                // Ensure it's in the relative state to get the correct original position
                const wasFixed = isFixed;
                isFixed = false; // Temporarily set to relative
                requestAnimationFrame(() => {
                    // Wait for potential DOM update after state change
                    originalOffsetTop =
                        backButton.getBoundingClientRect().top + window.scrollY;

                    // Set the initial state based on the current scroll position
                    const fixedThreshold = originalOffsetTop - 20;
                    isFixed = window.scrollY >= fixedThreshold;

                    // Add the scroll listener
                    window.addEventListener("scroll", handleScroll);
                });
            }
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
            ? 'fixed top-5 left-10 md:left-20 z-50'
            : 'relative mt-5 ml-10 md:ml-20'} flex self-start p-2 hover:shadow-xl transition duration-300 border border-gray-300 bg-blue-300 rounded-lg w-fit gap-2 text-gray-700 hover:text-blue-600"
        href="/"
    >
        <MoveLeft class="w-5 h-5" />
        <p class="text-sm font-medium">Back to Home</p>
    </a>
    <div
        class="max-w-4xl mx-auto bg-gray-100 border-0 border-gray-100 p-8 rounded-xl shadow-2xl mt-5 w-full"
    >
        <h2 class="text-3xl font-bold mb-4 text-center">
            Choose your quiz experience
        </h2>
        <p class="text-lg text-gray-600 mb-10 text-center max-w-2xl mx-auto">
            Select how you want to experience your privacy knowledge challenge
            before we begin!
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Classic Mode Card -->
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
                <!-- Icon wrapped in a blue circle -->
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
                <!-- Popular choice label - positioned absolutely -->
                {#if selectedMode === "classic"}
                    <div
                        class="self-center bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full"
                    >
                        Popular choice
                    </div>
                {/if}
            </button>
            <!-- Compliance Track Card -->
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
                <!-- Icon wrapped in a blue circle -->
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
                <!-- Popular choice label - positioned absolutely -->
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

    <!-- Timing section -->
    <div
        class="max-w-4xl mx-auto bg-gray-100 border-0 border-gray-100 p-8 rounded-xl shadow-2xl mt-8 w-full"
    >
        <h2 class="text-3xl font-bold mb-4 text-center">Choose timing</h2>
        <p class="text-lg text-gray-600 mb-10 text-center max-w-2xl mx-auto">
            Decide whether you want to tackle the questions under pressure or
            learn at a relaxed pace.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Timed Quiz Card -->
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
            <!-- Free Mode Card -->
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

    <!-- Button to proceed (placeholder) -->
    <button
        class="mt-10 px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-xl shadow-lg hover:bg-blue-700 transition duration-300"
    >
        Start Quiz
    </button>
</div>
