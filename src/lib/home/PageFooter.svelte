<!-- PageFooter.svelte -->
<script>
    const footerText = ""; // Or add responsive text here if needed, but prompt seems to imply layout/style responsiveness
    const copyrightText = `© ${new Date().getFullYear()} Iwajoo. All rights reserved.`;
</script>

<footer
    class="bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 text-center"
>
    <div class="max-w-5xl mx-auto">
        <!-- Adjusted text size for potential responsiveness if needed, but text-lg is usually fine -->
        <p class="text-base sm:text-lg mb-4">{footerText}</p>

        <!-- Make main links stack vertically on mobile, then horizontal on sm+ -->
        <div
            class="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-6 mb-6"
        >
            <a href="#" class="hover:text-white hover:underline">About</a>
            <a href="#" class="hover:text-white hover:underline"
                >Privacy Notice</a
            >
            <a href="#" class="hover:text-white hover:underline">Legal Notice</a
            >
            <a href="#" class="hover:text-white hover:underline">Iwajoo</a>
        </div>

        <!-- Make social links stack vertically on mobile, then horizontal on sm+ -->
        <div
            class="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-6 mb-6"
        >
            <!-- Ideally use SVG icons here -->
            <a href="#" aria-label="LinkedIn" class="hover:text-white"
                >LinkedIn</a
            >
            <a href="#" aria-label="Twitter" class="hover:text-white"
                >X (Twitter)</a
            >
        </div>

        <!-- Adjusted text size for potential responsiveness -->
        <p class="text-xs sm:text-sm text-gray-400">{copyrightText}</p>
    </div>
</footer>
