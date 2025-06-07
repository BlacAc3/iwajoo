<script>
    import { onMount } from "svelte";
    // Importing chevron icons for toggle functionality, save, cancel, edit, and delete icons
    import {
        ChevronDown,
        ChevronRight,
        Save,
        XCircle,
        Edit,
        Trash2, // Import the Trash2 icon for deletion
        Search, // Import Search icon for the search bar
    } from "@lucide/svelte";

    // State variables for the "Add New Question" form
    let newQuestionText = "";
    let newOptions = ["", "", "", ""]; // Assuming 4 options for multiple choice
    // Use a number or null to represent the index of the correct answer (0, 1, 2, 3)
    let newCorrectAnswerIndex = null;

    // State variable for the list of questions fetched from the backend
    // Assuming each question object from the backend includes an 'id' property
    let questions = [];
    let loading = true;
    let error = null;

    // State variable for managing tabs: 'add' or 'view'
    let selectedTab = "add"; // Start with the Add tab active

    // State variable for managing expanded questions in the 'view' tab (to show options)
    // Stores the index of the currently expanded question *within the original 'questions' array*, or null if none are expanded
    let expandedQuestionIndex = null;

    // State variable for managing the question currently being edited
    // Stores a copy of the question object being edited, or null if not editing
    let editingQuestion = null; // { id: string, text: string, options: string[], correctAnswerIndex: number } | null

    // State variable for search term
    let searchTerm = "";

    // Reactive declaration for filtered questions based on searchTerm
    // Ensure filtering is case-insensitive
    $: filteredQuestions = questions.filter((question) =>
        question.text.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Function to load questions from the backend API
    async function loadQuestions() {
        loading = true;
        error = null;
        // Reset expanded and editing states when loading new questions to avoid stale state
        expandedQuestionIndex = null;
        editingQuestion = null;

        try {
            // Assuming a SvelteKit endpoint exists at /admin/questions
            // and it returns an array of question objects, each with an 'id'.
            const response = await fetch("/admin/questions");
            if (response.ok) {
                const data = await response.json();
                questions = data; // Update the questions array
            } else {
                // Handle non-OK responses
                const errBody = await response.text();
                console.error(
                    "Failed to load questions:",
                    response.status,
                    errBody,
                );
                error = `Failed to load questions: ${response.status} ${response.statusText}`;
            }
        } catch (err) {
            console.error("Error fetching questions:", err);
            error = `An error occurred while fetching questions: ${err.message}`;
        } finally {
            loading = false;
        }
    }

    // Function to add a new question via the backend API
    async function addQuestion() {
        // Basic validation
        if (
            !newQuestionText.trim() ||
            newOptions.some((opt) => !opt.trim()) ||
            newCorrectAnswerIndex === null || // Check if an option is selected
            newCorrectAnswerIndex < 0 ||
            newCorrectAnswerIndex > 3
        ) {
            alert(
                "Please fill out the question text, all four answer options, and select the correct answer.",
            );
            return;
        }

        const questionToAdd = {
            text: newQuestionText.trim(),
            options: newOptions.map((opt) => opt.trim()), // Trim options as well
            correctAnswerIndex: parseInt(newCorrectAnswerIndex, 10), // Ensure it's a number
        };

        try {
            // Send the new question to the backend
            const response = await fetch("/admin/questions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(questionToAdd),
            });

            if (response.ok) {
                // If the backend successfully added and saved, refresh the list
                // loadQuestions will also reset editing/expanded states
                await loadQuestions();

                // Clear the form upon successful addition
                newQuestionText = "";
                newOptions = ["", "", "", ""];
                newCorrectAnswerIndex = null; // Reset radio buttons

                // Alert user (consider a more subtle notification later)
                alert("Question added successfully!");
            } else {
                const errBody = await response.text();
                console.error(
                    "Failed to add question:",
                    response.status,
                    errBody,
                );
                alert(
                    `Failed to add question: ${response.status} ${response.statusText}\n${errBody}`,
                );
            }
        } catch (err) {
            console.error("Error adding question:", err);
            alert(
                `An error occurred while adding the question: ${err.message}`,
            );
        }
    }

    // Function to initiate editing for a specific question
    function startEditing(question) {
        // Set the editingQuestion state to a copy of the question object
        // This prevents directly modifying the object in the 'questions' array before saving
        editingQuestion = { ...question, options: [...question.options] };
        // Ensure the question being edited is expanded
        // Find the index in the *original* questions array to update expandedQuestionIndex
        expandedQuestionIndex = questions.findIndex(
            (q) => q.id === question.id,
        );
    }

    // Function to cancel editing
    function cancelEditing() {
        // Store the ID of the question that *was* being edited
        const wasEditingId = editingQuestion?.id;
        const wasExpandedIndex = expandedQuestionIndex; // Store before potential nulling

        editingQuestion = null; // Set editing state to null

        // If the question that was being edited was also the currently expanded one, collapse it
        if (wasEditingId !== undefined && wasExpandedIndex !== null) {
            const wasEditingIndex = questions.findIndex(
                (q) => q.id === wasEditingId,
            );
            if (
                wasEditingIndex !== -1 &&
                wasExpandedIndex === wasEditingIndex
            ) {
                expandedQuestionIndex = null; // Collapse the item
            }
        }
        // Reactive statements handle scenarios like switching tabs while editing was active.
    }

    // Function to save the edited question via the backend API
    async function saveEditedQuestion() {
        if (!editingQuestion) return; // Should not happen if save button is shown correctly

        // Basic validation for edited question
        if (
            !editingQuestion.text.trim() ||
            editingQuestion.options.some((opt) => !opt.trim()) ||
            editingQuestion.correctAnswerIndex === null || // Check if an option is selected
            editingQuestion.correctAnswerIndex < 0 ||
            editingQuestion.correctAnswerIndex > 3
        ) {
            alert(
                "Please fill out the question text, all answer options, and select the correct answer before saving.",
            );
            return;
        }

        const questionToSave = {
            id: editingQuestion.id, // Include the ID for the PUT request
            text: editingQuestion.text.trim(),
            options: editingQuestion.options.map((opt) => opt.trim()),
            correctAnswerIndex: parseInt(
                editingQuestion.correctAnswerIndex,
                10,
            ),
        };

        try {
            // Send the updated question to the backend using PUT with the question ID
            // Assumes a PUT endpoint exists at /admin/questions/:id
            const response = await fetch(
                `/admin/questions/${questionToSave.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(questionToSave),
                },
            );

            if (response.ok) {
                // If the backend successfully updated and saved, refresh the list
                // loadQuestions will also clear the editing state
                await loadQuestions();

                // Alert user (consider a more subtle notification later)
                alert("Question updated successfully!");
            } else {
                const errBody = await response.text();
                console.error(
                    `Failed to update question ${questionToSave.id}:`,
                    response.status,
                    errBody,
                );
                alert(
                    `Failed to update question: ${response.status} ${response.statusText}\n${errBody}`,
                );
            }
        } catch (err) {
            console.error(`Error updating question ${questionToSave.id}:`, err);
            alert(
                `An error occurred while updating the question: ${err.message}`,
            );
        }
    }

    // Function to delete a question via the backend API
    async function deleteQuestion(id) {
        if (
            !confirm(
                "Are you sure you want to delete this question? This action cannot be undone.",
            )
        ) {
            return; // User cancelled deletion
        }

        try {
            // Send the DELETE request to the backend with the question ID
            // Assumes a DELETE endpoint exists at /admin/questions/:id
            const response = await fetch(`/admin/questions/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                // If the backend successfully deleted, refresh the list
                // loadQuestions will also clear editing/expansion if the deleted item was active
                await loadQuestions();

                // Alert user (consider a more subtle notification later)
                alert("Question deleted successfully!");
            } else {
                const errBody = await response.text();
                console.error(
                    `Failed to delete question ${id}:`,
                    response.status,
                    errBody,
                );
                alert(
                    `Failed to delete question: ${response.status} ${response.statusText}\n${errBody}`,
                );
            }
        } catch (err) {
            console.error(`Error deleting question ${id}:`, err);
            alert(
                `An error occurred while deleting the question: ${err.message}`,
            );
        }
    }

    // Function to toggle the expansion of a question to show/hide options
    // Accepts the question object itself
    function toggleQuestionExpansion(questionToToggle) {
        // Find the index of this question in the *original* questions array
        // We use the original array index because expandedQuestionIndex tracks this array
        const originalIndex = questions.findIndex(
            (q) => q.id === questionToToggle.id,
        );

        // If currently editing a *different* question, prevent toggling others
        if (editingQuestion && editingQuestion.id !== questionToToggle.id) {
            alert(
                "Please save or cancel the current edit before viewing another question.",
            );
            return;
        }

        // If clicking the currently expanded question (and not editing it), collapse
        // Check against originalIndex as expandedQuestionIndex tracks the original list
        if (expandedQuestionIndex === originalIndex) {
            expandedQuestionIndex = null; // Collapse
        } else {
            // Expand the clicked question
            // This will happen if nothing is being edited, OR if the clicked question IS the one being edited.
            expandedQuestionIndex = originalIndex;
        }
        // Note: The editing state is managed by startEditing/cancelEditing/saveEditedQuestion
        // and reactive statements, not directly by toggling expansion unless editing
        // is specifically started or cancelled *on this item*.
    }

    // Load questions when the component mounts
    onMount(() => {
        loadQuestions();
    });

    // Reactive statement to handle tab switching while editing
    $: {
        // If the tab switches to 'add' *while* editing, cancel the edit
        if (editingQuestion && selectedTab === "add") {
            // Use requestAnimationFrame to avoid potential state update cycles if cancelEditing itself triggers reactive blocks
            requestAnimationFrame(() => {
                cancelEditing();
            });
        }
        // If we switch to 'view' tab *while* editing, ensure the edited question is expanded
        // Note: Check if editingQuestion is still in the main questions list
        if (editingQuestion && selectedTab === "view") {
            const index = questions.findIndex(
                (q) => q.id === editingQuestion.id,
            );
            if (index !== -1) {
                // If found, ensure its index is set as expanded
                if (expandedQuestionIndex !== index) {
                    // Use requestAnimationFrame to avoid potential state update cycles
                    requestAnimationFrame(() => {
                        expandedQuestionIndex = index;
                    });
                }
            } else {
                // Question being edited might have been deleted by another user/process
                // Or loadQuestions failed to find it after an async operation. Cancel edit state.
                requestAnimationFrame(() => {
                    cancelEditing();
                });
            }
        }
    }

    // Reactive statement to handle editing state when question data changes (e.g., after save/delete)
    $: {
        // If the questions list changes (e.g., after save/delete from another session)
        // and we were editing a question, check if that question still exists.
        // If it doesn't (e.g., deleted), cancel the edit state.
        if (editingQuestion) {
            const questionExists = questions.some(
                (q) => q.id === editingQuestion.id,
            );
            if (!questionExists) {
                // Use requestAnimationFrame to avoid potential state update cycles
                requestAnimationFrame(() => {
                    cancelEditing(); // Cancel editing if the question is no longer in the list
                });
            } else {
                // If the question still exists, ensure expandedQuestionIndex is correct
                // It's possible the index shifted after a deletion elsewhere.
                const currentOriginalIndex = questions.findIndex(
                    (q) => q.id === editingQuestion.id,
                );
                if (expandedQuestionIndex !== currentOriginalIndex) {
                    // Use requestAnimationFrame
                    requestAnimationFrame(() => {
                        expandedQuestionIndex = currentOriginalIndex;
                    });
                }
            }
        }
    }
</script>

<!-- Apply responsive padding: p-4 on small screens, p-6 on larger -->
<div class="container mx-auto sm:p-6 p-4 min-h-screen">
    <!-- Apply responsive text size: text-2xl on small screens, text-3xl on larger -->
    <h1 class="sm:text-3xl text-2xl font-bold mb-8 text-center">
        Admin Dashboard
    </h1>

    <!-- Tab Navigation -->
    <div class="flex gap-4 justify-center mb-8">
        <!-- Apply responsive padding and text size for buttons -->
        <button
            class="sm:py-3 sm:px-6 py-2 px-4 sm:text-lg text-base font-semibold hover:cursor-pointer rounded-2xl transition duration-300
                   {selectedTab === 'add'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
            on:click={() => {
                selectedTab = "add";
                // Reactive statement handles cancelling edit if needed
            }}
            disabled={!!editingQuestion}
            aria-controls="add-question-form"
            aria-selected={selectedTab === "add"}
            role="tab"
        >
            Add Questions
        </button>
        <!-- Apply responsive padding and text size for buttons -->
        <button
            class="sm:py-3 sm:px-6 py-2 px-4 hover:cursor-pointer sm:text-lg text-base font-semibold rounded-2xl transition duration-300
                   {selectedTab === 'view'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
            on:click={() => (selectedTab = "view")}
            disabled={!!editingQuestion}
            aria-controls="view-questions-list"
            aria-selected={selectedTab === "view"}
            role="tab"
        >
            View Questions
        </button>
    </div>

    <!-- Tab Content -->
    <!-- Apply responsive padding: p-4 on small screens, p-6 on larger -->
    <div
        class="max-w-3xl mx-auto bg-blue-200 rounded-xl shadow-2xl opacity-80 sm:p-6 p-4"
        role="tabpanel"
        style="background-image: radial-gradient(circle, rgba(96, 165, 250, 0.6) 1.5px, transparent 1.5px); background-size: 15px 15px;"
        aria-labelledby={selectedTab === "add"
            ? "add-question-form"
            : "view-questions-list"}
    >
        {#if selectedTab === "add"}
            <!-- Add New Question Form -->
            <div
                id="add-question-form"
                role="tabpanel"
                hidden={selectedTab !== "add"}
            >
                {#if !editingQuestion}
                    <!-- Only show add form if not editing -->
                    <!-- Apply responsive text size: text-xl on small, text-2xl on larger -->
                    <h2
                        class="sm:text-2xl text-xl font-semibold mb-6 text-center"
                    >
                        Add Questions
                    </h2>
                    <form
                        on:submit|preventDefault={addQuestion}
                        class="space-y-5"
                    >
                        <div>
                            <label
                                for="questionText"
                                class="block text-sm font-medium text-gray-700 mb-1"
                                >Question Text:</label
                            >
                            <textarea
                                id="questionText"
                                bind:value={newQuestionText}
                                rows="4"
                                class="mt-1 block w-full border border-gray-800 rounded-md shadow-sm sm:p-3 p-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                                placeholder="Enter the question text..."
                                required
                                aria-required="true"
                            ></textarea>
                        </div>

                        <!-- Apply responsive padding: p-3 on small, p-4 on larger -->
                        <fieldset
                            class="border border-gray-900 sm:p-4 p-3 rounded-md"
                        >
                            <legend
                                class="block text-sm font-medium text-gray-700 mb-2 px-1"
                                >Answer Options (Exactly 4):</legend
                            >
                            {#each newOptions as option, index}
                                <div class="flex items-center gap-3 mb-3">
                                    <span
                                        class="flex-shrink-0 text-gray-600 font-medium w-4"
                                        >{String.fromCharCode(
                                            65 + index,
                                        )}.</span
                                    >
                                    <input
                                        type="text"
                                        bind:value={newOptions[index]}
                                        class="flex-grow border border-gray-400 rounded-md shadow-sm sm:p-3 p-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                        required
                                        aria-required="true"
                                    />
                                    <div
                                        class="flex items-center flex-shrink-0"
                                    >
                                        <input
                                            type="radio"
                                            name="correctAnswer"
                                            id={`correctOption${index}`}
                                            value={index}
                                            bind:group={newCorrectAnswerIndex}
                                            class="focus:ring-blue-800 h-4 w-4 text-blue-600 border-gray-300 cursor-pointer"
                                        />
                                        <label
                                            for={`correctOption${index}`}
                                            class="ml-2 text-sm text-gray-700 cursor-pointer"
                                            >Correct</label
                                        >
                                    </div>
                                </div>
                            {/each}
                        </fieldset>

                        <!-- Apply responsive padding and text size for button -->
                        <button
                            type="submit"
                            class="w-full sm:px-6 sm:py-3 px-4 py-2 hover:cursor-pointer bg-blue-600 text-white font-semibold rounded-md shadow-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:text-lg text-base"
                        >
                            Add Question
                        </button>
                    </form>
                {/if}
            </div>
        {:else if selectedTab === "view"}
            <!-- Existing Questions List -->
            <div
                id="view-questions-list"
                role="tabpanel"
                hidden={selectedTab !== "view"}
            >
                <!-- Apply responsive text size: text-xl on small, text-2xl on larger -->
                <h2 class="sm:text-2xl text-xl font-semibold mb-6 text-center">
                    Questions
                </h2>

                {#if loading}
                    <p class="text-center text-gray-600 text-base">
                        Loading questions...
                    </p>
                {:else if error}
                    <p class="text-center text-red-600 text-base">
                        Error: {error}
                    </p>
                {:else}
                    <!-- Search Bar -->
                    <div class="mb-6 relative">
                        <!-- Input padding and text size are already reasonable -->
                        <input
                            type="text"
                            bind:value={searchTerm}
                            placeholder="Search questions..."
                            class="w-full pl-10 pr-4 py-2 border border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
                            disabled={!!editingQuestion}
                            aria-label="Search questions"
                        />
                        <div
                            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                        >
                            <Search class="h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    {#if filteredQuestions.length === 0 && searchTerm === ""}
                        <p class="text-center text-gray-600 text-base">
                            No questions added yet.
                        </p>
                    {:else if filteredQuestions.length === 0 && searchTerm !== ""}
                        <p class="text-center text-gray-600 text-base">
                            No questions match your search term "{searchTerm}".
                        </p>
                    {:else}
                        <ul class="flex flex-col gap-3">
                            {#each filteredQuestions as question (question.id)}
                                <!-- Use question.id as key -->
                                <!-- Find the index in the original array for expansion state -->
                                {@const originalIndex = questions.findIndex(
                                    (q) => q.id === question.id,
                                )}
                                <!-- Apply responsive padding: p-3 on small, p-4 on larger -->
                                <li
                                    class="sm:p-4 p-3 border border-gray-400 rounded-2xl shadow-xs"
                                >
                                    <!-- Clickable Question Header & Edit/Delete Buttons -->
                                    <!-- Existing flex items-center justify-between works well -->
                                    <div
                                        class="flex items-center justify-between"
                                    >
                                        <!-- Button acts as the question text -->
                                        <button
                                            class="flex-grow text-left hover:cursor-pointer flex items-center focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                            on:click={() =>
                                                toggleQuestionExpansion(
                                                    question,
                                                )}
                                            aria-expanded={expandedQuestionIndex ===
                                                originalIndex}
                                            aria-controls={`options-${question.id}`}
                                            disabled={!!editingQuestion &&
                                                editingQuestion.id !==
                                                    question.id}
                                        >
                                            <!-- Apply responsive text size: text-base on small, text-lg on larger -->
                                            <p
                                                class="font-semibold text-gray-800 sm:text-lg text-base leading-relaxed flex-grow pr-2"
                                            >
                                                <!-- Display original index + 1 -->
                                                Q{originalIndex + 1} --- {question.text}
                                            </p>
                                            <!-- Toggle Icon: size h-5 w-5 is fine -->
                                            {#if expandedQuestionIndex === originalIndex}
                                                <ChevronDown
                                                    class="w-5 h-5 text-gray-600 ml-2 flex-shrink-0"
                                                />
                                            {:else}
                                                <ChevronRight
                                                    class="w-5 h-5 text-gray-600 ml-2 flex-shrink-0"
                                                />
                                            {/if}
                                        </button>

                                        <!-- Edit and Delete Buttons -->
                                        {#if !editingQuestion}
                                            <!-- Show only if not already editing something -->
                                            <!-- Flex container is fine, button sizes are okay -->
                                            <div
                                                class="flex items-center gap-2 ml-4 flex-shrink-0"
                                            >
                                                <!-- Button text size text-sm is fine -->
                                                <button
                                                    class="px-3 py-1 bg-blue-500 hover:cursor-pointer text-white text-sm rounded hover:bg-blue-600 transition duration-200 flex items-center gap-1"
                                                    on:click={() =>
                                                        startEditing(question)}
                                                    aria-label="Edit question Q{originalIndex +
                                                        1}"
                                                >
                                                    <Edit class="w-4 h-4" /> Edit
                                                </button>
                                                <!-- Button text size text-sm is fine -->
                                                <button
                                                    class="px-3 py-1 bg-red-500 text-white hover:cursor-pointer text-sm rounded hover:bg-red-600 transition duration-200 flex items-center gap-1"
                                                    on:click={() =>
                                                        deleteQuestion(
                                                            question.id,
                                                        )}
                                                    aria-label="Delete question Q{originalIndex +
                                                        1}"
                                                >
                                                    <Trash2 class="w-4 h-4" /> Delete
                                                </button>
                                            </div>
                                        {/if}
                                    </div>

                                    <!-- Collapsible Answer Options / Edit Form -->
                                    {#if expandedQuestionIndex === originalIndex}
                                        <!-- Apply responsive margin-left: ml-2 on small, ml-4 on larger -->
                                        <div
                                            id={`options-${question.id}`}
                                            class="sm:ml-4 ml-2 mt-3 border-t border-gray-400 pt-3"
                                            role="region"
                                            aria-labelledby={`question-${question.id}`}
                                        >
                                            {#if editingQuestion?.id === question.id}
                                                <!-- Edit Form for this question -->
                                                <form
                                                    on:submit|preventDefault={saveEditedQuestion}
                                                    class="space-y-4"
                                                >
                                                    <div>
                                                        <label
                                                            for={`edit-question-text-${question.id}`}
                                                            class="block text-sm font-medium text-gray-700 mb-1"
                                                            >Question Text:</label
                                                        >
                                                        <textarea
                                                            id={`edit-question-text-${question.id}`}
                                                            bind:value={
                                                                editingQuestion.text
                                                            }
                                                            rows="3"
                                                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm sm:p-3 p-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                                                            required
                                                            aria-required="true"
                                                        ></textarea>
                                                    </div>
                                                    <!-- Fieldset padding is already handled by the parent li -->
                                                    <fieldset
                                                        class="border border-gray-300 p-4 rounded-md"
                                                    >
                                                        <legend
                                                            class="block text-sm font-medium text-gray-700 mb-2 px-1"
                                                            >Answer Options
                                                            (Exactly 4):</legend
                                                        >
                                                        {#each editingQuestion.options as option, oIndex}
                                                            <div
                                                                class="flex items-center gap-3 mb-2"
                                                            >
                                                                <span
                                                                    class="flex-shrink-0 text-gray-600 font-medium w-4"
                                                                    >{String.fromCharCode(
                                                                        65 +
                                                                            oIndex,
                                                                    )}.</span
                                                                >
                                                                <input
                                                                    type="text"
                                                                    bind:value={
                                                                        editingQuestion
                                                                            .options[
                                                                            oIndex
                                                                        ]
                                                                    }
                                                                    class="flex-grow border border-gray-300 rounded-md shadow-sm sm:p-3 p-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                                                                    required
                                                                    aria-required="true"
                                                                />
                                                                <div
                                                                    class="flex items-center flex-shrink-0"
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name={`edit-correct-answer-${question.id}`}
                                                                        id={`edit-correct-option-${question.id}-${oIndex}`}
                                                                        value={oIndex}
                                                                        bind:group={
                                                                            editingQuestion.correctAnswerIndex
                                                                        }
                                                                        class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 cursor-pointer"
                                                                    />
                                                                    <label
                                                                        for={`edit-correct-option-${question.id}-${oIndex}`}
                                                                        class="ml-1 text-sm text-gray-700 cursor-pointer"
                                                                        >Correct</label
                                                                    >
                                                                </div>
                                                            </div>
                                                        {/each}
                                                    </fieldset>
                                                    <!-- Allow buttons to wrap on small screens -->
                                                    <div
                                                        class="flex flex-wrap justify-end gap-3"
                                                    >
                                                        <!-- Button padding and text size are fine -->
                                                        <button
                                                            type="button"
                                                            on:click={cancelEditing}
                                                            class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition duration-200 flex items-center gap-1 text-sm"
                                                        >
                                                            <XCircle
                                                                class="w-4 h-4"
                                                            /> Cancel
                                                        </button>
                                                        <!-- Button padding and text size are fine -->
                                                        <button
                                                            type="submit"
                                                            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-200 flex items-center gap-1 text-sm"
                                                        >
                                                            <Save
                                                                class="w-4 h-4"
                                                            />
                                                            Save Changes
                                                        </button>
                                                    </div>
                                                </form>
                                            {:else}
                                                <!-- Read-only view of options -->
                                                <ul
                                                    class="space-y-2 text-gray-700"
                                                >
                                                    {#each question.options as option, oIndex}
                                                        <li
                                                            class="flex items-start gap-2 {oIndex ===
                                                            question.correctAnswerIndex
                                                                ? 'text-green-700 font-medium'
                                                                : ''}"
                                                        >
                                                            {#if oIndex === question.correctAnswerIndex}
                                                                <!-- Correct icon (check circle): size h-5 w-5 is fine -->
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    class="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5"
                                                                    viewBox="0 0 20 20"
                                                                    fill="currentColor"
                                                                >
                                                                    <path
                                                                        fill-rule="evenodd"
                                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                                        clip-rule="evenodd"
                                                                    />
                                                                </svg>
                                                            {:else}
                                                                <!-- Default icon (empty circle): size h-5 w-5 is fine -->
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    class="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                    stroke-width="2"
                                                                >
                                                                    <path
                                                                        stroke-linecap="round"
                                                                        stroke-linejoin="round"
                                                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                    />
                                                                </svg>
                                                            {/if}
                                                            <!-- Text size text-base is fine -->
                                                            <span
                                                                class="text-base"
                                                                >{String.fromCharCode(
                                                                    65 + oIndex,
                                                                )}. {option}</span
                                                            >
                                                        </li>
                                                    {/each}
                                                </ul>
                                            {/if}
                                        </div>
                                    {/if}
                                </li>
                            {/each}
                        </ul>
                    {/if}
                {/if}
            </div>
        {/if}
    </div>
</div>
