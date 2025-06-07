import { redirect } from "@sveltejs/kit";
import jwt from "jsonwebtoken";

const JWT_SECRET = "your_super_secret_jwt_key_replace_me"; // Replace with your actual secret key

export const load = async ({ cookies, fetch }) => {
  // Add fetch to the load context
  const token = cookies.get("token");

  if (!token) {
    // If no token, redirect to login immediately
    throw redirect(302, "/login");
  }

  try {
    // Verify the token
    jwt.verify(token, JWT_SECRET);

    // Token is valid. Now fetch the questions from the dedicated API endpoint.
    // Use the provided fetch function from the load context, which handles internal calls efficiently.
    const questionsResponse = await fetch("/admin/questions");

    // Check if the fetch was successful
    if (!questionsResponse.ok) {
      // Log the fetch error. Based on the original code's error handling,
      // any failure here will result in a redirect to login.
      console.error(
        `Failed to fetch questions: ${questionsResponse.status} ${questionsResponse.statusText}`,
      );
      // Throw an error to be caught by the surrounding try/catch block
      throw new Error("Failed to fetch questions after authentication");
    }

    const questions = await questionsResponse.json();

    // Return the fetched questions data to the page component
    return {
      questions: questions,
    };
  } catch (error) {
    // This catch block handles both JWT verification errors and the error thrown if fetch failed.
    console.error(
      "Error in admin load function (auth or data fetch):",
      error.message,
    );
    // Following the original code's behavior, any error caught here leads to a redirect.
    throw redirect(302, "/login");
  }
};
