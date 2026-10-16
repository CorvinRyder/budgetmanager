import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/db";
import CheckUser from "@/utils/CheckUser";

export async function GET(req: NextRequest) {
  const userId = await CheckUser(req);
  if (!userId) return NextResponse.json("", { status: 401 });

  const sqlReq = (await connectToDatabase()).request();

  sqlReq.input("userid", userId);
  const result = await sqlReq.query(
    "SELECT tag_id, tag_name from dbo.bm_tags where user_id = @userid and deleted is null"
  );
  return NextResponse.json(result.recordset, { status: 200 });
}
