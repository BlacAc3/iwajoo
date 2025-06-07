<script>
    import { goto } from "$app/navigation";

    let email = ""; // Changed from username to email
    let password = "";
    let error = "";
    let fieldErrors = {}; // To potentially store specific field errors from validation

    async function handleSubmit() {
        error = ""; // Clear previous errors
        fieldErrors = {}; // Clear previous field errors

        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // Send email instead of username
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            goto("/admin");
            window.location.href = "/admin";
        } else {
            // Handle generic errors and potentially validation errors
            if (response.status === 400 && data.errors) {
                // Handle validation errors from Zod
                fieldErrors = data.errors;
                // You might want a general message too, or just rely on field errors
                error = data.message || "Please check your input.";
            } else {
                // Handle 401 or other errors
                error = data.message || "Login failed. Please try again.";
            }
        }
    }
</script>

<div class="flex justify-center items-center h-screen bg-gray-100">
    <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 class="block text-gray-700 text-center text-2xl font-bold mb-4">
            Login
        </h2>
        {#if error}
            <p class="text-red-500 text-sm italic mb-4">{error}</p>
        {/if}
        <form on:submit|preventDefault={handleSubmit}>
            <div class="mb-4">
                <label
                    class="block text-gray-700 text-sm font-bold mb-2"
                    for="email"
                >
                </label>
                <input
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    class:border-red-500={fieldErrors.email}
                    id="email"
                    type="email"
                    placeholder="Email"
                    bind:value={email}
                />
                {#if fieldErrors.email}
                    <p class="text-red-500 text-xs italic">
                        {fieldErrors.email[0]}
                    </p>
                {/if}
            </div>
            <div class="mb-6">
                <label
                    class="block text-gray-700 text-sm font-bold mb-2"
                    for="password"
                >
                    Password
                </label>
                <input
                    class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    class:border-red-500={fieldErrors.password}
                    id="password"
                    type="password"
                    placeholder="Password"
                    bind:value={password}
                />
                {#if fieldErrors.password}
                    <p class="text-red-500 text-xs italic">
                        {fieldErrors.password[0]}
                    </p>
                {/if}
            </div>
            <div class="flex items-center justify-between">
                <button
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                >
                    Sign In
                </button>
            </div>
        </form>
    </div>
</div>
```
