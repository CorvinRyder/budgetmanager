"use server";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/db";
import bcrypt from "bcryptjs";

export default async function HandleLogin(
  prevState: { status: number; message: string } | undefined,
  formData: FormData
) {
  const username = formData.get("username");
  const password = formData.get("password");
  const rememberMe = formData.get("rememberMe") !== null;

  console.debug(username, password, rememberMe, prevState);

  try {
    const result = (
      await (await connectToDatabase())
        .request()
        .input("email", username?.toString())
        .query(
          "SELECT userid, name, password FROM bm_users where email = @email and status = 'T'"
        )
    ).recordset[0];

    const hashedPassword = result?.["password"] || "FAKE_PASSWORD_HASH";

    const isPasswordValid = await bcrypt.compare(
      password?.toString() || "",
      hashedPassword
    );

    if (!isPasswordValid)
      return {
        status: 401,
        message:
          "The username and password combination does not match any record!",
      };

    const JWT_SECRET = new TextEncoder().encode(
      process.env.JWT_SECRET || "fallback-secret-use-a-real-one-in-env"
    );

    const token = await new SignJWT({
      role: "user",
      name: result?.["name"],
    }) // Custom claims go here
      .setProtectedHeader({ alg: "HS256" }) // Define the signing algorithm
      .setSubject(result?.["userid"] as string) // The 'sub' claim (usually the User ID)
      .setIssuedAt() // The 'iat' claim (current timestamp)
      .setExpirationTime(rememberMe ? "2 weeks" : "30m") // The 'exp' claim (e.g., 15 minutes, 2 hours, 1 day)
      .sign(JWT_SECRET); // Cryptographically sign the token

    const cookieStore = await cookies();
    cookieStore.set("session-token", token, {
      httpOnly: true, // Prevents client-side JS tampering (Critical for security)
      secure: true, // Ensures cookie is only sent over HTTPS
      sameSite: "strict", // Protects against CSRF attacks
      maxAge: 60 * 60 * (rememberMe ? 24 * 14 : 0.5), // 1 day expiration
      path: "/", // Available across your entire system
    });

    return {
      status: 200,
      message: "OK",
    };
  } catch (e) {
    console.debug(e);
    return {
      status: 500,
      message: "Unable to log you in due to a server error!",
    };
  }
}
