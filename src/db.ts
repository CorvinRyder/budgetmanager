import sql from "mssql";
import { env } from "process";

const conStr: string = env.CONNSTR || "";

export async function connectToDatabase() {
  try {
    const pool = await sql.connect(conStr);
    return pool;
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
}
