import path from "path";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import CheckUser from "@/utils/CheckUser";
import { connectToDatabase } from "@/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const userId = await CheckUser(req);
  if (!userId) return NextResponse.json("", { status: 401 });

  const filename = (await params).filename;
  const filePath = path.join(process.cwd(), "receipts", filename);

  const sqlReq = (await connectToDatabase()).request();
  sqlReq.input("userId", userId);
  sqlReq.input("filename", filename);
  const result = await sqlReq.query(
    "SELECT count(1) cnt FROM bm_receipts WHERE userid = @userId AND filename = @filename"
  );

  if (result.recordset[0].cnt === 0) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let mimetype = filename
    .substring(filename.lastIndexOf(".") + 1)
    .toLowerCase();
  if (mimetype === "jpg") mimetype = "jpeg";

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return new NextResponse(fs.readFileSync(filePath), {
    headers: {
      "Content-Type": "image/" + mimetype,
      "Content-Disposition": "inline",
    },
  });
}
