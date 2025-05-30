import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/db";
import sql from "mssql";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  if (formData.get("transdata") === undefined) return NextResponse.error();

  const transData: Transaction = JSON.parse(
    formData.get("transdata") as string
  );

  if (transData.items.length === 0) return NextResponse.error();

  // return NextResponse.json({ status: "ok" });

  let pool = await connectToDatabase();
  var trans = pool.transaction();
  await trans.begin();
  try {
    let sqlReq = trans.request();
    sqlReq.input("location", transData.location);
    let transId: number = (
      await sqlReq.query(
        "INSERT INTO foodmgmt.dbo.bm_transaction(transdate, location) output inserted.trans_id VALUES(getDate(), @location);"
      )
    ).recordset[0]["trans_id"];
    console.debug(transId);
    const table = new sql.Table("bm_cashflow");
    // table.columns.add("cashflow_id", sql.Int, { nullable: false });
    table.columns.add("trans_id", sql.Int, { nullable: false });
    table.columns.add("amount", sql.Money, { nullable: false });
    table.columns.add("item", sql.NVarChar, { nullable: false });
    table.columns.add("category", sql.VarChar, { nullable: false });
    table.columns.add("remark", sql.NVarChar);

    transData.items.forEach((i) => {
      table.rows.add(
        // undefined,
        transId,
        i.amount,
        i.item,
        i.category,
        i.remark
      );
    });
    await sqlReq.bulk(table);
    // req.bulk(table
    //   "INSERT INTO foodmgmt.dbo.bm_cashflow (trans_id, amount, item, category, remark) VALUES(@trans_id, @amount, @item, @category, @remark);"
    // );

    const file = formData.get("file") as File;
    if (file !== undefined) {
      let fileName = file.name;
      let extPos = fileName.lastIndexOf(".");
      fileName =
        transId +
        "_" +
        fileName.substring(0, extPos - 1).substring(0, 200) +
        fileName.substring(extPos);
      const fileBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(fileBuffer);
      await fs.writeFile(`./public/receipts/${fileName}`, buffer);
      sqlReq.input("trans_id", transId);
      sqlReq.input("filename", fileName);
      await sqlReq.query(
        "INSERT INTO foodmgmt.dbo.bm_receipts(trans_id, modified_date, filename) VALUES (@trans_id, getDate(), @filename);"
      );
    }
    await trans.commit();
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.debug(err);
    await trans.rollback();
    return NextResponse.json(
      { message: err },
      { status: 500 } // 👈 Set HTTP status code
    );
  }
}
