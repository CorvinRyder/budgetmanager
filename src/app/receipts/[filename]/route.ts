import path from "path";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const filename = (await params).filename;
  const filePath = path.join(process.cwd(), "receipts", filename);

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
