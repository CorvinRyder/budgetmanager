"use server";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

export default async function HandleLogin(formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password");

  if (username === null || password === null) return;

  const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "fallback-secret-use-a-real-one-in-env"
  );

  const token = await new SignJWT({ role: "test" }) // Custom claims go here
    .setProtectedHeader({ alg: "HS256" }) // Define the signing algorithm
    .setSubject(username as string) // The 'sub' claim (usually the User ID)
    .setIssuedAt() // The 'iat' claim (current timestamp)
    .setExpirationTime("15m") // The 'exp' claim (e.g., 15 minutes, 2 hours, 1 day)
    .sign(JWT_SECRET); // Cryptographically sign the token

  const cookieStore = await cookies();
  cookieStore.set("session-token", token, {
    httpOnly: true, // Prevents client-side JS tampering (Critical for security)
    secure: true, // Ensures cookie is only sent over HTTPS
    sameSite: "strict", // Protects against CSRF attacks
    maxAge: 60 * 60 * 24, // 1 day expiration
    path: "/", // Available across your entire system
  });
}
