import {
  _writeQuestions as writeQuestions,
  _readQuestions as readQuestions,
} from "../+server.js"; // Assuming _readQuestions and _writeQuestions are in the same directory's +server.js
import { json, error as kitError } from "@sveltejs/kit";

// Handle PUT requests to update an existing question using the slug (route parameter)
export async function PUT({ request, params }) {
  const id = params.questionId;

  // Validate that an ID was provided from the route parameter
  if (!id || typeof id !== "string") {
    throw kitError(
      400,
      "Missing or invalid 'questionId' route parameter for update.",
    );
  }

  let updatedQuestionData;
  try {
    // Parse the JSON payload from the request body
    updatedQuestionData = await request.json();
  } catch (err) {
    // If JSON parsing fails, return a 400 Bad Request error
    throw kitError(400, "Invalid JSON payload");
  }

  // Validation: check if the required fields (excluding 'id' which is from params) are present and have the correct types
  const requiredBodyFields = ["text", "options", "correctAnswerIndex"];
  for (const field of requiredBodyFields) {
    if (!(field in updatedQuestionData)) {
      throw kitError(
        400,
        `Missing required field in payload for update: ${field}`,
      );
    }
  }

  // More specific validation for types and options array structure from the body
  if (
    typeof updatedQuestionData.text !== "string" ||
    !Array.isArray(updatedQuestionData.options) ||
    updatedQuestionData.options.length !== 4 ||
    !updatedQuestionData.options.every((opt) => typeof opt === "string") ||
    typeof updatedQuestionData.correctAnswerIndex !== "number" ||
    updatedQuestionData.correctAnswerIndex < 0 ||
    updatedQuestionData.correctAnswerIndex > 3
  ) {
    throw kitError(
      400,
      "Invalid update data structure or types in payload. Expected { text: string, options: [string, string, string, string], correctAnswerIndex: number (0-3) }",
    );
  }

  // Destructure required fields from the request body
  const { text, options, correctAnswerIndex } = updatedQuestionData;

  try {
    // Read the existing questions
    const questions = await readQuestions();

    // Find the index of the question to update by its ID from the route parameter
    const questionIndex = questions.findIndex((q) => q.id === id);

    // If the question is not found, return a 404 Not Found error
    if (questionIndex === -1) {
      throw kitError(404, `Question with id ${id} not found`);
    }

    // Update the question object at the found index using data from the body and the ID from params
    questions[questionIndex] = {
      id: id, // Use the ID from the route parameter
      text: text.trim(), // Use validated and trimmed data from body
      options: options.map((opt) => opt.trim()), // Use validated and trimmed data from body
      correctAnswerIndex: correctAnswerIndex, // Use validated data from body
    };

    // Save the updated list of questions back to the file
    await writeQuestions(questions);

    // Return the updated question object
    return json(questions[questionIndex]);
  } catch (err) {
    // readQuestions or writeQuestions already throws a kitError, rethrow it
    if (err.status) {
      throw err;
    }
    // Catch any other unexpected errors
    console.error(`Unexpected error in PUT /admin/questions/${id}:`, err);
    throw kitError(
      500,
      `An unexpected error occurred while updating the question with id ${id}`,
    );
  }
}

// Handle DELETE requests to remove a question using the slug (route parameter)
export async function DELETE({ params }) {
  const id = params.questionId;

  // Validate that an ID was provided (it should be, as it's part of the route)
  if (!id || typeof id !== "string") {
    // This error should ideally not happen if the route is defined correctly
    // as /[id], but it's good practice to check.
    throw kitError(
      400,
      "Missing or invalid 'questionId' route parameter for deletion.",
    );
  }

  try {
    // Read the existing questions
    const questions = await readQuestions();

    // Filter out the question with the matching ID
    const initialLength = questions.length;
    const updatedQuestions = questions.filter((q) => q.id !== id);

    // If the length hasn't changed, the question wasn't found
    if (updatedQuestions.length === initialLength) {
      throw kitError(404, `Question with id ${id} not found`);
    }

    // Save the updated list of questions (without the deleted one) back to the file
    await writeQuestions(updatedQuestions);

    // Return a success response (204 No Content is standard for successful deletion)
    return new Response(null, { status: 204 });
  } catch (err) {
    // readQuestions or writeQuestions already throws a kitError, rethrow it
    if (err.status) {
      throw err;
    }
    // Catch any other unexpected errors
    console.error(`Unexpected error in DELETE /admin/questions/${id}:`, err);
    throw kitError(
      500,
      `An unexpected error occurred while deleting the question with id ${id}`,
    );
  }
}
