import { NextResponse } from "next/server";
import { connectToDatabase } from "@/db";

export async function GET() {
  const pool = await connectToDatabase();
  const trans = pool.transaction();
  await trans.begin();
  const sqlReq = trans.request();
  const resultSet = await sqlReq.query(
    "select cat_code, category from bm_categories"
  );
  pool.close();
  return NextResponse.json(resultSet.recordset, { status: 200 });
}
