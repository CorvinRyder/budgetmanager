import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/db";
import CheckUser from "@/utils/CheckUser";

export async function POST(req: NextRequest) {
  const userId = await CheckUser(req);
  if (!userId) return NextResponse.json("", { status: 401 });

  const transData: Transaction = await req.json();

  if (
    !transData.trans_id ||
    !transData.rating ||
    typeof transData.comment === "undefined" ||
    transData.comment.length > 256
  )
    return NextResponse.json(
      { message: "Invalid requestion data!" },
      { status: 400 }
    );

  const pool = await connectToDatabase();
  const sqlReq = pool.request();

  sqlReq.input("transId", transData.trans_id);
  sqlReq.input("userId", userId);

  try {
    const result = await sqlReq.query(
      "SELECT 1 from dbo.bm_transaction where trans_id = @transId and userid = @userid and deleted is null"
    );

    if (result.recordset.length === 0)
      return NextResponse.json(
        { message: "Transaction not found!" },
        { status: 404 }
      );

    sqlReq.input("comment", transData.comment);
    sqlReq.input("rating", transData.rating);

    const result2 = await sqlReq.query(
      "UPDATE dbo.bm_trans_rating SET comment = @comment, rating = @rating WHERE trans_id = @transID"
    );

    if (result2.rowsAffected[0] === 0) {
      await sqlReq.query(
        "INSERT INTO dbo.bm_trans_rating (trans_id, comment, rating) VALUES (@transID, @comment, @rating)"
      );
    }

    return NextResponse.json({ message: "OK" }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: e }, { status: 500 });
  }
}
