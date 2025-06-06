<script>
    import Hero from "$lib/home/Hero.svelte";
    import OurPurpose from "$lib/home/OurPurpose.svelte";
    import KeyFeatures from "$lib/home/KeyFeatures.svelte";
    import OurMission from "$lib/home/OurMission.svelte";
    import Team from "$lib/home/Team.svelte";
    import CallToAction from "$lib/home/CallToAction.svelte";
    import PageFooter from "$lib/home/PageFooter.svelte";

    // Assuming you have an app.css file with Tailwind directives
</script>

<div class="font-sans text-white">
    <main
        class="max-w-6xl mx-auto flex flex-col items-center gap-28 px-4 sm:px-6 lg:px-8 py-8"
    >
        <div
            class="my-18 w-full p-8 relative flex flex-col items-center overflow-hidden"
        >
            <div
                class="absolute w-[600px] h-[100px] top-20 left-1/2 -translate-x-1/2 rounded-2xl bg-blue-400 opacity-75 filter blur-3xl"
            ></div>
            <div class="bg-transparent relative z-10">
                <Hero />
            </div>
        </div>
        <div class="bg-gray-300 p-8 w-screen">
            <OurPurpose />
        </div>
        <KeyFeatures />
        <div class="bg-gray-300 w-screen">
            <OurMission />
        </div>
        <div class="mb-16">
            <CallToAction />
        </div>
    </main>
    <PageFooter />
</div>
