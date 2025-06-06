<!-- PageFooter.svelte -->
<script>
    const footerText = "";
    const copyrightText = `© ${new Date().getFullYear()} Iwajoo. All rights reserved.`;
</script>

<footer
    class="bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 text-center"
>
    <div class="max-w-5xl mx-auto">
        <p class="text-lg mb-4">{footerText}</p>
        <div class="flex justify-center space-x-6 mb-6">
            <a href="#" class="hover:text-white hover:underline">About</a>
            <a href="#" class="hover:text-white hover:underline"
                >Privacy Notice</a
            >
            <a href="#" class="hover:text-white hover:underline">Legal Notice</a
            >
            <a href="#" class="hover:text-white hover:underline">Iwajoo</a>
        </div>
        <div class="flex justify-center space-x-6 mb-6">
            <!-- Ideally use SVG icons here -->
            <a href="#" aria-label="LinkedIn" class="hover:text-white"
                >LinkedIn</a
            >
            <a href="#" aria-label="Twitter" class="hover:text-white"
                >X (Twitter)</a
            >
        </div>
        <p class="text-sm text-gray-400">{copyrightText}</p>
    </div>
</footer>
