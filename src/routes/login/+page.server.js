import { redirect } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import { dev } from "$app/environment";

const JWT_SECRET =
  process.env.JWT_SECRET || "your_super_secret_jwt_key_replace_me";

export async function load({ cookies }) {
  const token = cookies.get("token");

  let user = null;

  // 1. Check JWT Token first (stateless)
  if (token) {
    let decoded = null;
    try {
      // Attempt to verify the token
      decoded = jwt.verify(token, JWT_SECRET);

      // If verification succeeds, set the user object
      user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
      };
      console.log("Authenticated via token:", user?.email);
    } catch (err) {
      // Token invalid or expired - this is the only type of error we catch here
      console.log(err);
      console.warn("JWT verification failed:", err.message);
      // Clear invalid/expired token cookie
      cookies.delete("token", {
        path: "/",
        httpOnly: true,
        secure: !dev,
        sameSite: "lax",
      });
      // Ensure user is null as authentication failed
      user = null;
    }

    // 2. If user was successfully authenticated via token, redirect
    if (user) {
      throw redirect(302, "/admin"); // Throw redirect outside the verification catch block
    }
  }

  // This return is only reached if there was no token or the token was invalid/expired
  return {
    user: user,
  };
}
