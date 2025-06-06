<!-- CallToAction.svelte -->
<script>
    import { Shield } from "@lucide/svelte";
    const ctaTitle = "Start Your Privacy Assessment Today";
    const ctaSubtitle = "No account needed. No hidden fees. Just clarity.";
    const ctaButtonText = "Start Free Assessment";
</script>

<section
    class="text-center flex flex-col gap-6 items-center py-10 sm:py-18 px-6 sm:px-8 lg:px-24 text-white rounded-xl shadow-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-gray-400 bg-gradient-to-tr from-blue-300 to-[#6f6fc7]"
>
    <Shield size="60" />
    <div>
        <h3 class="text-3xl sm:text-4xl font-semibold mb-3">{ctaTitle}</h3>
        <p class="text-lg sm:text-2xl mb-6 max-w-xl mx-auto">{ctaSubtitle}</p>
    </div>
    <a
        href="/quiz-setting"
        class="bg-white hover:cursor-pointer hover:bg-gray-200 hover:from-gray-300 hover:to-slate-800 text-blue-500 font-semibold py-3 px-8 rounded-3xl text-lg shadow-md transition duration-300 ease-in-out"
    >
        {ctaButtonText}
    </a>
</section>
