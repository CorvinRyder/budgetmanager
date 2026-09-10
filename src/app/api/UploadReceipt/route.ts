import { connectToDatabase } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import CheckUser from "@/utils/CheckUser";

async function saveReceiptFile(file: File) {
  let fileName = file.name;
  const extPos = fileName.lastIndexOf(".");
  fileName =
    Date.now().toString(16) +
    "_" +
    fileName.substring(0, extPos - 1).substring(0, 200) +
    fileName.substring(extPos);

  const fileBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(fileBuffer);

  await fs.writeFile(`${process.cwd()}/receipts/${fileName}`, buffer);

  return fileName;
}

export async function PUT(req: NextRequest) {
  const userId = await CheckUser(req);
  if (!userId) return NextResponse.json("", { status: 401 });

  const formData = await req.formData();

  const file = formData.get("file") as File;

  if (file === undefined) return NextResponse.error();

  const fileName = await saveReceiptFile(file);

  const pool = await connectToDatabase();
  const trans = pool.transaction();
  await trans.begin();
  try {
    const sqlReq = trans.request();
    sqlReq.input("filename", fileName);
    sqlReq.input("userid", userId);
    const receiptId = (
      await sqlReq.query(
        "INSERT INTO dbo.bm_receipts(trans_id, modified_date, filename, userid) output inserted.receipt_id VALUES (-1, getDate(), @filename, @userid);"
      )
    ).recordset[0]["receipt_id"];

    await trans.commit();
    return NextResponse.json({ filename: fileName, receipt_id: receiptId });
  } catch (err) {
    console.debug(err);
    return NextResponse.json(
      { message: err },
      { status: 500 } // 👈 Set HTTP status code
    );
  } finally {
    pool.close();
  }
}
