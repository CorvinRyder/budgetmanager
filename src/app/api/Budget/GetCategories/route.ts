import { NextResponse } from "next/server";
import { connectToDatabase } from "@/db";

export async function GET() {
  const resultSet = await (await connectToDatabase())
    .request()
    .query("select cat_code, category from bm_categories");
  return NextResponse.json(resultSet.recordset, { status: 200 });
}
