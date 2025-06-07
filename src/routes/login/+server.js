import { json, error as kitError } from "@sveltejs/kit";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken"; // Import jsonwebtoken
import { dev } from "$app/environment"; // Import dev environment flag

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
const TOKEN_EXPIRES_IN = 60 * 60 * 1; //1 hour in seconds

// This is just a placeholder for the example.
const JWT_SECRET =
  process.env.JWT_SECRET || "your_super_secret_jwt_key_replace_me";

// --- Simulated User Database (Replace with your actual database logic) ---
// In a real app, passwords would be hashed when users register.
const users = [
  {
    id: "user1",
    email: "test@example.com",
    // Hashed password for "password123"
    passwordHash: bcrypt.hashSync("password123", 10),
    name: "Test User",
  },
  {
    id: "user2",
    email: "admin@gmail.com",
    passwordHash: bcrypt.hashSync("secureadmin", 10),
    name: "Admin User",
  },
];

// --- Simulated Session Store (Replace with Redis, database table, etc. in production) ---
// This is a very basic in-memory store, not suitable for production scaling or persistence.
// We keep this for the example as the prompt asks to *also* add a token.
const sessions = new Map(); // sessionId -> { userId, expiresAt }

// --- Zod Schema for Login ---
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export async function POST({ request, cookies }) {
  let requestData;
  try {
    requestData = await request.json();
  } catch (err) {
    throw kitError(400, "Invalid JSON payload");
  }

  // 1. Validate Input
  const validationResult = loginSchema.safeParse(requestData);
  if (!validationResult.success) {
    return json(
      {
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { email, password } = validationResult.data;

  // 2. Find User
  const user = users.find((u) => u.email === email);

  if (!user) {
    // Generic error to prevent email enumeration
    return json({ message: "Invalid email or password" }, { status: 401 });
  }

  // 3. Verify Password
  const passwordMatch = bcrypt.compareSync(password, user.passwordHash);

  if (!passwordMatch) {
    // Generic error
    return json({ message: "Invalid email or password" }, { status: 401 });
  }

  // 4. Create Server-Side Session (kept as per original code)
  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  // Store session server-side (in our simple Map for this example)
  sessions.set(sessionId, {
    userId: user.id,
    email: user.email,
    name: user.name,
    expiresAt,
  });
  console.log("Session created:", sessionId, sessions.get(sessionId));

  // 5. Generate JWT
  // Create a payload with non-sensitive user information
  const tokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name, // Add name if needed in the token
  };

  // Sign the token with the secret key and set an expiration
  const token = jwt.sign(tokenPayload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN,
  }); // Use same max age as session

  // 6. Set Session and JWT Cookies
  // Session ID cookie (for server-side lookup if needed)
  cookies.set("sessionId", sessionId, {
    path: "/",
    httpOnly: true, // Crucial: Prevents client-side JS access
    secure: !dev, // Crucial: Only send over HTTPS (true in production, false in local dev if not using HTTPS)
    sameSite: "lax", // Good default for CSRF protection
    maxAge: SESSION_MAX_AGE, // Cookie lifetime in seconds
  });

  // JWT cookie (can be used for stateless authentication)
  cookies.set("token", token, {
    path: "/", // Cookie is available across the entire domain for all routes
    httpOnly: true, // Crucial: Prevents client-side JS access
    secure: false, // Crucial: Only send over HTTPS
    sameSite: "lax", // Good default for CSRF protection
    maxAge: TOKEN_EXPIRES_IN, // Cookie lifetime in seconds
  });

  // 7. Return Success Response (don't send password hash back)
  return json(
    {
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        // Add any other non-sensitive user info you want the client to have
      },
      token: token, // Add the generated token to the response body as requested
    },
    { status: 200 },
  );
}
