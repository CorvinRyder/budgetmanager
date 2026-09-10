import sql from "mssql";
import { env } from "process";

const conStr: string = env.CONNSTR || "";
const poolPromise = sql.connect(conStr);

export async function connectToDatabase(): Promise<sql.ConnectionPool> {
  try {
    return await poolPromise;
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
}
