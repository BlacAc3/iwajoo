<script>
    const heroTitle = "Iwajoo";
    const assessmentButtonText = "Start Free Assessment";
    const aboutUsTitle = "About Us";
    const subHeadline = "Making data protection accessible across Africa.";
</script>

<section
    class={`text-center flex flex-col gap-6  items-center text-gray-500 py-16 px-4 sm:px-6 lg:px-8  rounded-lg ${$$props.class}`}
>
    <!-- Made h1 text size responsive -->
    <h1
        class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6"
    >
        {heroTitle}
    </h1>
    <!-- Made p width and text size responsive -->
    <p
        class="w-full sm:w-11/12 md:w-5/6 lg:w-3/4 text-base sm:text-lg md:text-xl lg:text-2xl"
    >
        Our platform offers a free assessment designed to help businesses across
        Africa evaluate their data protection practices and identify areas for
        improvement.
    </p>
    <a
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg shadow-md transition duration-300 ease-in-out mb-10 w-full sm:w-auto"
        href="/quiz-setting"
    >
        {assessmentButtonText}
    </a>
</section>
