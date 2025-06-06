<script>
    const heroTitle = "Iwajoo";
    const assessmentButtonText = "Start Free Assessment";
    const aboutUsTitle = "About Us";
    const subHeadline = "Making data protection accessible across Africa.";
</script>

<section
    class={`text-center flex flex-col gap-6  items-center text-gray-500 py-16 px-4 sm:px-6 lg:px-8  rounded-lg ${$$props.class}`}
>
    <h1 class="text-7xl font-bold text-gray-900 mb-6">{heroTitle}</h1>
    <p class="w-3/4 text-2xl">
        Our platform offers a free assessment designed to help businesses across
        Africa evaluate their data protection practices and identify areas for
        improvement.
    </p>
    <button
        on:click={() => alert("Navigate to assessment")}
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg shadow-md transition duration-300 ease-in-out mb-10"
    >
        {assessmentButtonText}
    </button>
</section>
