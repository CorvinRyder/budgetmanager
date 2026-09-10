"use server";
import { connectToDatabase } from "@/db";
import bcrypt from "bcryptjs";

export default async function RegisterAction(
  prevState: { status: number; message: string } | undefined,
  formData: FormData
) {
  const username = formData.get("username");
  const password = formData.get("password");
  const email = formData.get("email");

  if (username === null || password === null)
    return {
      status: 401,
      message: "Please provide username and password!",
    };
  let pool;
  let trans;
  try {
    pool = await connectToDatabase();
    trans = pool.transaction();
    await trans.begin();
    const sqlReq = trans.request();
    sqlReq.input("user", username);
    sqlReq.input("email", email);

    const result = await sqlReq.query(
      "SELECT count(1) cnt from bm_users where name=@user or email=@email"
    );

    if (result.recordset[0]["cnt"] > 0)
      return {
        status: 401,
        message: "Either the username or email is taken!",
      };

    const storedHashString = await bcrypt.hash(password.toString(), 12);
    sqlReq.input("password", storedHashString);

    const insertResult = await sqlReq.query(
      "INSERT INTO bm_users (name, password, email, created_date, status) VALUES (@user, @password, @email, getDate(), 'T')"
    );
    if (insertResult.rowsAffected[0] > 0)
      return {
        status: 200,
        message: "OK",
      };
  } catch (e) {
    console.debug(e);
    return {
      status: 401,
      message: "Error occurred when saving the registration data!",
    };
  } finally {
    await trans?.commit();
    pool?.close();
  }
}
