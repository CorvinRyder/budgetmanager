import { NextRequest } from "next/server";
import { connectToDatabase } from "@/db";

export default async function CheckUser(req: NextRequest): Promise<boolean> {
  const userId = req.headers.get("x-user-id");

  if (!userId) return false;

  const pool = await connectToDatabase();
  const trans = pool.transaction();
  await trans.begin();
  const sqlReq = trans.request();

  sqlReq.input("userId", userId);

  const result = await sqlReq.query(
    `SELECT count(1) cnt FROM bm_users WHERE userid = @userId AND status = 'T'`
  );

  pool.close();

  return result.recordset[0]?.cnt > 0 ? true : false;
}
