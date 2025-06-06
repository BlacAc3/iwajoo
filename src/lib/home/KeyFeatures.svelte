<script>
    import { ShieldQuestion } from "@lucide/svelte";

    const features = [
        {
            // Store the component reference, not an instance
            icon: ShieldQuestion,
            title: "Number of Questions",
            description:
                "Tackle a set of 10 questions covering various topics.",
        },
        {
            // Add icon to other features as requested
            icon: ShieldQuestion,
            title: "Time Limit",
            description: "You have 15 minutes to complete the quiz.",
        },
        {
            // Add icon to other features as requested
            icon: ShieldQuestion,
            title: "Instant Results",
            description:
                "See your score and feedback immediately after finishing.",
        },
    ];
</script>

<section
    class="py-12 flex flex-col items-center gap-4 text-gray-800 px-4 sm:px-6 lg:px-8 bg-transparent"
>
    <div class="text-4xl text-blue-800 font-bold">How it works</div>
    <p class="text-lg">
        Three simple steps to test and improve your privacy knowledge
    </p>
    <div
        class="max-w-6xl flex flex-col gap-6 mx-auto grid md:grid-cols-3 gap-8 text-center"
    >
        {#each features as feature}
            <div
                class="p-6 bg-white flex flex-col items-center gap-4 rounded-lg border border-gray-300 shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-[0_5px_35px_0_rgba(0,0,0,0.3)]"
            >
                <!-- Use <svelte:component> to render the component stored in the data -->
                <div class="bg-blue-700 rounded-full p-4">
                    <svelte:component
                        this={feature.icon}
                        size="40"
                        color="white"
                    />
                </div>
                <h4 class="text-2xl font-semibold text-blue-600 mb-2">
                    {feature.title}
                </h4>
                <p class="text-gray-600">{feature.description}</p>
            </div>
        {/each}
    </div>
</section>
