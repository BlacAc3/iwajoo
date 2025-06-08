import { json, error as kitError } from "@sveltejs/kit";
import fs from "fs/promises"; // Use promises version for async filesystem operations
import path from "path";
import { v4 as uuidv4 } from "uuid"; // Import uuid to generate unique IDs
// import { dev } from '$app/environment'; // Not used in this endpoint logic, but good to know it exists

// Resolve the path to the questions.json file
// __filename is the path to the current module file (`src/routes/api/questions/+server.js`)

// Assuming questions.json is intended to be stored outside of the public directory
// and preferably somewhere like src/lib/data or similar, relative to the project root.
// We navigate up from the current directory to the project root, then down to src/lib/data.
// __dirname = project-root/src/routes/api/questions
// path.resolve(__dirname, '../../../../src/lib/data/questions.json') resolves to project-root/src/lib/data/questions.json

// Helper function to read questions from the file
export async function _readQuestions() {
  try {
    const response = await fetch(
      "https://n8n-service-sfwl.onrender.com/webhook/6d7ba488-c384-4c7f-80b6-e66c4a2e3606",
    );

    if (!response.ok) {
      console.error(
        "Error fetching questions from API:",
        response.status,
        response.statusText,
      );
      throw kitError(500, "Failed to fetch questions data from API");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching or parsing questions data:", err);
    throw kitError(500, "Failed to fetch or parse questions data from API");
  }
}

// Helper function to write questions to the file
export async function _writeQuestions(questions) {
  // try {
  //   // Ensure the directory exists before writing the file
  //   const dir = path.dirname(QUESTIONS_FILE_PATH);
  //   await fs.mkdir(dir, { recursive: true }); // recursive: true creates parent directories if they don't exist
  //   // Write the questions array to the JSON file, formatted with 2 spaces for readability
  //   await fs.writeFile(
  //     QUESTIONS_FILE_PATH,
  //     JSON.stringify(questions, null, 2),
  //     "utf-8",
  //   );
  // } catch (err) {
  //   console.error("Error writing questions file:", err);
  //   throw kitError(500, "Failed to save questions data");
  // }
}

// --- Endpoint Handlers ---

// Handle GET requests to retrieve all questions
export async function GET() {
  try {
    const questions = await _readQuestions();
    // Return the questions array as a JSON response (which now includes IDs)
    return json(questions);
  } catch (err) {
    // readQuestions already throws a kitError, rethrow it
    if (err.status) {
      throw err;
    }
    // Catch any other unexpected errors
    console.error("Unexpected error in GET /api/questions:", err);
    throw kitError(500, "An unexpected error occurred");
  }
}

// Handle POST requests to add a new question
export async function POST({ request }) {
  let newQuestionData;
  try {
    // Parse the JSON payload from the request body
    newQuestionData = await request.json();
  } catch (err) {
    // If JSON parsing fails, return a 400 Bad Request error
    throw kitError(400, "Invalid JSON payload");
  }

  // Basic validation: check if the required fields are present and have the correct types
  const requiredFields = ["text", "options", "correctAnswerIndex"];
  for (const field of requiredFields) {
    if (!(field in newQuestionData)) {
      throw kitError(400, `Missing required field: ${field}`);
    }
  }

  // More specific validation for types and options array structure
  if (
    typeof newQuestionData.text !== "string" ||
    !Array.isArray(newQuestionData.options) ||
    newQuestionData.options.length !== 4 ||
    !newQuestionData.options.every((opt) => typeof opt === "string") ||
    typeof newQuestionData.correctAnswerIndex !== "number" ||
    newQuestionData.correctAnswerIndex < 0 ||
    newQuestionData.correctAnswerIndex > 3
  ) {
    throw kitError(
      400,
      "Invalid question data structure or types. Expected { text: string, options: [string, string, string, string], correctAnswerIndex: number (0-3) }",
    );
  }

  try {
    // Read the existing questions
    const questions = await _readQuestions();

    // Generate a unique ID for the new question
    const id = uuidv4();

    // Create the new question object with the generated ID, ensuring structure and trimming strings
    const questionToSave = {
      id: id, // Add the unique ID
      text: newQuestionData.text.trim(),
      options: newQuestionData.options.map((opt) => opt.trim()),
      correctAnswerIndex: newQuestionData.correctAnswerIndex,
    };

    // Add the new question to the array
    questions.push(questionToSave);

    // Save the updated list of questions back to the file
    await _writeQuestions(questions);

    // Return the newly created question object including its ID
    return json(questionToSave, { status: 201 });
  } catch (err) {
    // readQuestions or writeQuestions already throws a kitError, rethrow it
    if (err.status) {
      throw err;
    }
    // Catch any other unexpected errors
    console.error("Unexpected error in POST /api/questions:", err);
    throw kitError(
      500,
      "An unexpected error occurred while adding the question",
    );
  }
}
