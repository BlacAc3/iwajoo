<!-- Team.svelte -->
<script>
    const teamTitle = "The Team";
    const teamIntro =
        "This platform is a product of collaboration between Tolulope Ogundele and Ridwan Oloyede, privacy professionals dedicated to supporting organisations in meeting their regulatory obligations efficiently and effectively. [1]";
    const teamMembers = [
        { name: "Tolulope Ogundele", linkedin: "#" }, // Replace # with actual LinkedIn URL
        { name: "Ridwan Oloyede", linkedin: "#" }, // Replace # with actual LinkedIn URL
    ];
</script>

<section class="py-12 px-4 sm:px-6 lg:px-8 text-center">
    <h3 class="text-3xl font-semibold text-gray-800 mb-4">{teamTitle}</h3>
    <p class="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto mb-8">
        {teamIntro}
    </p>
    <div
        class="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12"
    >
        {#each teamMembers as member}
            <div class="p-4">
                <h4 class="text-xl font-medium text-gray-800 mb-1">
                    {member.name}
                </h4>
                <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-600 hover:text-blue-800 hover:underline"
                >
                    Connect on LinkedIn
                </a>
            </div>
        {/each}
    </div>
</section>
