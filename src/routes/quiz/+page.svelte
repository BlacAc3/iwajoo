<script>
    import { onMount, onDestroy } from "svelte"; // Added onDestroy for explicit cleanup
    import {
        MoveLeft,
        Brain,
        Shield,
        Check,
        Clock,
        Infinity,
    } from "@lucide/svelte";
    import { goto } from "$app/navigation"; // Import for programmatic navigation
    // Import the object containing the stores
    import { quizSettings } from "$lib/stores/quizSettings.svelte.js";
    // Import the questions data
    import questionsData from "$lib/data/questions.json";

    // Destructure the individual stores from the imported object
    // Note: '$' prefix is used in reactive declarations or HTML to access the store's value
    const { easy, noTimeLimit } = quizSettings;

    // Reactive variables derived from store values for display purposes
    $: selectedMode = $easy ? "classic" : "compliance";
    $: selectedTiming = $noTimeLimit ? "free" : "timed";

    // --- Quiz State Variables ---
    let selectedQuestions = []; // Array to hold the selected questions for this quiz instance
    let currentQuestionIndex = 0; // Index of the currently displayed question
    // selectedAnswerIndex: null = no selection, index = user selection, -1 = timed out
    let selectedAnswerIndex = null;
    let answerSubmitted = false; // Flag to indicate if an answer has been submitted for the current question
    let isCorrect = false; // Flag to indicate if the submitted answer is correct
    let score = 0; // User's score
    let quizComplete = false; // Flag to indicate if the quiz is finished

    // --- Timer Variables (if timed mode) ---
    const TIME_PER_QUESTION = 15; // Time limit per question in seconds
    let timerValue = TIME_PER_QUESTION; // Current value of the timer
    let timerInterval; // Variable to hold the setInterval ID
    let timeoutDelay = null; // Variable to hold the timeout ID for moving to the next question after feedback

    // Reactive variable for the current question object
    $: currentQuestion = selectedQuestions[currentQuestionIndex];

    // Function to start the quiz (select questions and initialize state)
    function startQuiz() {
        // Stop any running timers or timeouts from a previous quiz instance
        stopTimer();
        clearTimeout(timeoutDelay);
        timeoutDelay = null;

        // Define the total number of questions to select
        const numberOfQuestionsToSelect = questionsData.length; // Use all available questions for now

        // Start with all questions
        let availableQuestions = [...questionsData];

        // TODO: Implement category filtering here if needed based on selectedMode

        // Simple Fisher-Yates (or Knuth) shuffle algorithm
        for (let i = availableQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // Corrected Math.random() typo
            [availableQuestions[i], availableQuestions[j]] = [
                availableQuestions[j],
                availableQuestions[i],
            ];
        }

        // Select the desired number of questions
        selectedQuestions = availableQuestions.slice(
            0,
            Math.min(numberOfQuestionsToSelect, availableQuestions.length),
        );

        // Reset quiz state
        currentQuestionIndex = 0;
        selectedAnswerIndex = null;
        answerSubmitted = false;
        isCorrect = false;
        score = 0;
        quizComplete = false;
        timerValue = TIME_PER_QUESTION; // Reset timer value for the first question

        // Start timer if in timed mode and there are questions selected
        if (!$noTimeLimit && selectedQuestions.length > 0) {
            // Use a slight delay before starting the timer for the *first* question
            // to give the UI a moment to update after starting the quiz.
            setTimeout(() => {
                startTimer();
            }, 50); // Adjust delay as needed
        }
        console.log("Quiz started. Selected questions:", selectedQuestions);
    }

    // Function to select an option
    function selectOption(index) {
        // Only allow selection if answer hasn't been submitted yet
        if (!answerSubmitted) {
            selectedAnswerIndex = index;
            checkAnswer();
            console.log("Selected option index:", index);
        }
    }

    // Function to check the submitted answer
    function checkAnswer() {
        // If no answer is selected and it's timed mode, treat it as a timeout
        if (selectedAnswerIndex === null && !$noTimeLimit) {
            console.log("Timed out: selectedAnswerIndex is null");
            // Set selectedAnswerIndex to -1 to indicate timeout without a visual selection
            selectedAnswerIndex = -1;
        } else if (selectedAnswerIndex === null && $noTimeLimit) {
            // In free mode, require an answer to be selected before checking
            console.log(
                "Attempted to check answer in free mode with no selection.",
            );
            return; // Do nothing if no option is selected in free mode
        }
        console.log("Checking answer...");

        answerSubmitted = true;
        stopTimer(); // Stop timer as soon as answer is submitted

        // Determine correctness: must be in bounds (not -1 timeout) AND index must match correct index
        isCorrect =
            selectedAnswerIndex !== -1 &&
            selectedAnswerIndex === currentQuestion.correctAnswerIndex;

        if (isCorrect) {
            score++; // Increment score if correct
            console.log("Answer is correct! Score:", score);
        } else {
            console.log(
                "Answer is incorrect. Correct index:",
                currentQuestion.correctAnswerIndex,
            );
        }

        // In timed mode, automatically proceed after showing feedback for a duration
        if (!$noTimeLimit) {
            console.log("Timed mode, setting timeout for next question.");
            timeoutDelay = setTimeout(nextQuestion, 2000); // Wait 2 seconds before moving on
        } else {
            // In free mode, the user clicks "Next Question" manually
            console.log("Free mode, waiting for manual 'Next Question' click.");
        }
    }

    // Function to move to the next question or finish the quiz
    function nextQuestion() {
        console.log("Moving to next question...");
        // Clear any pending timeout for moving to the next question (important if user clicks 'Next' fast in free mode)
        clearTimeout(timeoutDelay);
        timeoutDelay = null;

        selectedAnswerIndex = null; // Reset selected answer
        answerSubmitted = false; // Reset submission state
        isCorrect = false; // Reset correctness
        timerValue = TIME_PER_QUESTION; // Reset timer value for the next question

        if (currentQuestionIndex < selectedQuestions.length - 1) {
            currentQuestionIndex++; // Move to the next question
            console.log("Current question index:", currentQuestionIndex);
            // Restart timer for the next question if in timed mode
            if (!$noTimeLimit) {
                // Use a slight delay before starting the timer for the *next* question
                // to give the UI a moment to update with the new question.
                setTimeout(() => {
                    startTimer();
                }, 50); // Adjust delay as needed
            }
        } else {
            // Quiz finished
            stopTimer(); // Ensure timer is stopped
            quizComplete = true;
            console.log("Quiz complete!");
        }
    }

    // Function to handle timeout (called when timer reaches 0)
    function handleTimeout() {
        console.log("Time out for question:", currentQuestionIndex);
        // Automatically check the answer. Since selectedAnswerIndex is still null,
        // checkAnswer will set it to -1 in timed mode and mark it incorrect.
        checkAnswer();
        // checkAnswer in timed mode will then automatically set the timeoutDelay for nextQuestion.
    }

    // --- Timer Functions ---
    function startTimer() {
        console.log("Starting timer...");
        // Clear any existing interval first to prevent multiple timers running
        stopTimer();
        timerValue = TIME_PER_QUESTION; // Start timer from the beginning

        timerInterval = setInterval(() => {
            timerValue--;
            if (timerValue <= 0) {
                stopTimer(); // Stop the timer immediately at 0
                handleTimeout(); // Call timeout handler
            }
        }, 1000); // Update every second
    }

    function stopTimer() {
        console.log("Stopping timer.");
        clearInterval(timerInterval);
    }

    // --- Lifecycle Hooks ---
    onMount(() => {
        // Start the quiz when the component mounts
        startQuiz();

        // Cleanup function returned by onMount is called when the component is destroyed
        return () => {
            console.log("Component destroyed, cleaning up timer and timeouts.");
            stopTimer(); // Stop the timer interval
            clearTimeout(timeoutDelay); // Clear any pending timeout
        };
    });

    // Reactive statement to handle dynamic changes to the time limit setting.
    // This ensures cleanup and correct timer state if the user could hypothetically
    // change the setting mid-quiz (though the current UI doesn't support this).
    // It also serves as a fallback if onMount timing is tricky.
    $: {
        console.log(
            "Time limit setting changed:",
            $noTimeLimit ? "Free" : "Timed",
        );
        // If switching to timed mode while a quiz is potentially active and not complete
        if (
            !$noTimeLimit &&
            !quizComplete &&
            selectedQuestions.length > 0 &&
            !answerSubmitted &&
            currentQuestionIndex < selectedQuestions.length
        ) {
            console.log("Detected switch to Timed mode, starting timer.");
            // Start timer for the *current* question if it hasn't been answered yet
            setTimeout(() => {
                // Add slight delay
                if (!answerSubmitted) {
                    // Double check if answer wasn't submitted during delay
                    startTimer();
                }
            }, 50);
        } else if ($noTimeLimit) {
            // If switching to free mode, stop any running timer and clear timeouts
            console.log(
                "Detected switch to Free mode, stopping timer and clearing timeouts.",
            );
            stopTimer();
            clearTimeout(timeoutDelay);
            timeoutDelay = null; // Ensure variable is reset
        }
    }

    // Reactive statement to log score change (optional, for debugging)
    $: console.log("Current Score:", score);
</script>

<div
    class="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center"
>
    <!-- Navigation Buttons -->
    <div
        class="w-full max-w-3xl mx-auto mb-8 flex justify-between items-center"
    >
        <a
            href="/"
            class="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition duration-200"
        >
            <MoveLeft class="w-5 h-5" />
            <span class="text-sm font-medium">Back to Home</span>
        </a>
        <a
            href="/quiz-setting"
            class="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition duration-200"
        >
            <span class="text-sm font-medium">Quiz Settings</span>
            <!-- Optional: Add a settings icon -->
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-settings-2"
                ><path d="M20 7h-9" /><path d="M14 17H5" /><circle
                    cx="17"
                    cy="17"
                    r="3"
                /><circle cx="7" cy="7" r="3" /></svg
            >
        </a>
    </div>

    <!-- Main Quiz Container -->
    <div class="w-full max-w-3xl bg-white rounded-lg shadow-xl p-6 sm:p-8">
        {#if quizComplete}
            <!-- Quiz Complete State -->
            <div class="text-center">
                <h2 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                    Quiz Complete!
                </h2>
                <p class="text-xl text-gray-700 mb-6">
                    Your final score is: <span
                        class="font-semibold text-blue-600"
                        >{score} / {selectedQuestions.length}</span
                    >
                </p>
                <!-- Add buttons to play again or go home -->
                <div class="flex justify-center gap-4">
                    <button
                        on:click={startQuiz}
                        class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition duration-200"
                    >
                        Play Again
                    </button>
                    <a
                        href="/"
                        class="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow hover:bg-gray-200 transition duration-200 flex items-center"
                    >
                        <MoveLeft class="w-4 h-4 mr-2" />
                        Go Home
                    </a>
                </div>
            </div>
        {:else if currentQuestion}
            <!-- Display Timer if in Timed Mode -->
            {#if !$noTimeLimit}
                <div class="text-center mb-6">
                    <div class="text-lg font-semibold text-gray-700">
                        Time Left: <span
                            class={timerValue <= 5 && timerValue > 0
                                ? "text-red-600 animate-pulse" // Add condition > 0 for pulse
                                : timerValue <= 0
                                  ? "text-red-600" // Solid red when time is exactly 0 or negative
                                  : "text-blue-600"}
                            >{Math.max(0, timerValue)}s</span
                        >
                        <!-- Ensure displayed time is not negative -->
                    </div>
                    <!-- Progress bar -->
                    <div
                        class="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden"
                    >
                        <div
                            class="h-2 bg-blue-500 transition-all duration-1000 ease-linear"
                            style="width: {Math.max(
                                0,
                                timerValue / TIME_PER_QUESTION,
                            ) * 100}%;"
                        ></div>
                    </div>
                </div>
            {/if}

            <!-- Question Number and Text -->
            <p class="text-sm text-gray-600 mb-2">
                Question {currentQuestionIndex + 1} of {selectedQuestions.length}
            </p>
            <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
                {currentQuestion.text}
            </h2>

            <!-- Options -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {#each currentQuestion.options as option, index}
                    {@const isSelected = selectedAnswerIndex === index}
                    {@const isCorrectAnswer =
                        answerSubmitted &&
                        index === currentQuestion.correctAnswerIndex}
                    {@const isUserWrongAnswer =
                        answerSubmitted &&
                        isSelected &&
                        !isCorrect &&
                        selectedAnswerIndex !== -1}

                    <button
                        class="border rounded-lg p-4 text-left transition duration-200
                        {answerSubmitted
                            ? isCorrectAnswer
                                ? 'border-green-500 bg-green-100 text-green-800 shadow-md cursor-default'
                                : isUserWrongAnswer
                                  ? 'border-red-500 bg-red-100 text-red-800 shadow-md cursor-default'
                                  : selectedAnswerIndex === -1 &&
                                      index ===
                                          currentQuestion.correctAnswerIndex
                                    ? 'border-green-500 bg-green-100 text-green-800 shadow-md cursor-default'
                                    : 'border-gray-200 bg-gray-50 text-gray-600 cursor-default opacity-75'
                            : isSelected
                              ? 'border-blue-500 bg-blue-100 shadow-md'
                              : 'border-gray-300 bg-white hover:border-blue-300 hover:shadow-sm'}"
                        on:click={() => selectOption(index)}
                        disabled={answerSubmitted}
                    >
                        {option}
                        {#if answerSubmitted}
                            {#if isCorrectAnswer}
                                <Check
                                    class="w-5 h-5 text-green-600 ml-auto inline-block align-middle"
                                />
                            {:else if isUserWrongAnswer}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="lucide lucide-x text-red-600 ml-auto inline-block align-middle"
                                    ><path d="M18 6 6 18" /><path
                                        d="m6 6 12 12"
                                    /></svg
                                >
                            {:else if selectedAnswerIndex === -1 && index === currentQuestion.correctAnswerIndex}
                                <!-- Show checkmark on correct answer during timeout feedback -->
                                <Check
                                    class="w-5 h-5 text-green-600 ml-auto inline-block align-middle"
                                />
                            {/if}
                        {/if}
                    </button>
                {/each}
            </div>

            <!-- Feedback and Navigation -->
            {#if answerSubmitted}
                <div class="text-center mb-6">
                    {#if isCorrect}
                        <p class="text-lg font-semibold text-green-600 mb-2">
                            Correct!
                        </p>
                    {:else if selectedAnswerIndex === -1}
                        <p class="text-lg font-semibold text-red-600 mb-2">
                            Time's up!
                        </p>
                        <p class="text-base text-gray-700">
                            The correct answer was: <span class="font-semibold"
                                >{currentQuestion.options[
                                    currentQuestion.correctAnswerIndex
                                ]}</span
                            >
                        </p>
                    {:else}
                        <!-- Incorrect user selection -->
                        <p class="text-lg font-semibold text-red-600 mb-2">
                            Incorrect.
                        </p>
                        <p class="text-base text-gray-700">
                            The correct answer was: <span class="font-semibold"
                                >{currentQuestion.options[
                                    currentQuestion.correctAnswerIndex
                                ]}</span
                            >
                        </p>
                    {/if}
                </div>

                {#if $noTimeLimit}
                    <!-- Button to move to the next question in Free Mode -->
                    <!-- This button is only shown AFTER submitting in free mode -->
                    <div class="text-center">
                        <button
                            on:click={nextQuestion}
                            class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition duration-200"
                        >
                            {currentQuestionIndex < selectedQuestions.length - 1
                                ? "Next Question"
                                : "Finish Quiz"}
                        </button>
                    </div>
                {:else}
                    <!-- In Timed Mode, the next question happens automatically via setTimeout -->
                    <!-- You could show a small indicator like "Moving to next question..." -->
                    <div class="text-center text-gray-600 text-sm">
                        {currentQuestionIndex < selectedQuestions.length - 1
                            ? "Moving to next question..."
                            : "Finishing quiz..."}
                    </div>
                {/if}
            {:else}
                <!-- Button to submit answer (only visible before submission) -->
                <div class="text-center">
                    <button
                        on:click={nextQuestion()}
                        disabled={selectedAnswerIndex === null}
                        class="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition duration-200"
                    >
                        Next Question
                    </button>
                </div>
            {/if}
        {:else}
            <!-- Loading or No Questions State -->
            <div class="text-center text-gray-600">
                {#if questionsData.length === 0}
                    <p>
                        No questions available. Please add questions via the
                        admin page.
                    </p>
                    <a
                        href="/admin"
                        class="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >Go to Admin Page</a
                    >
                {:else if selectedQuestions.length === 0}
                    <!-- This might happen briefly on mount if questionsData exists but startQuiz hasn't populated selectedQuestions yet -->
                    <p>Preparing quiz...</p>
                    <!-- Optional: Add a spinner -->
                {:else}
                    <!-- Fallback for other potential loading states -->
                    <p>Loading quiz...</p>
                {/if}
            </div>
        {/if}
    </div>
</div>
