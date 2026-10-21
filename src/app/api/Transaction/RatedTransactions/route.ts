import { NextRequest, NextResponse } from "next/server";
import CheckUser from "@/utils/CheckUser";
import getTransactions from "../getTransaction";

export async function GET(req: NextRequest) {
  const userId = await CheckUser(req);
  if (!userId) return NextResponse.json("", { status: 401 });

  return NextResponse.json(
    await getTransactions({
      userId,
      ratedOnly: true,
    })
  );
}
