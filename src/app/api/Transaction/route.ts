import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/db";
import sql from "mssql";
import fs from "fs/promises";

export async function GET(req: NextRequest) {
  let pool = await connectToDatabase();
  var trans = pool.transaction();
  await trans.begin();
  let sqlReq = trans.request();
  let sqlStatement = `
  select t1.trans_id, transdate, location,
  (select 
  cashflow_id, t2.trans_id, amount, item, category, remark 
  from foodmgmt.dbo.bm_cashflow t2 
  where t1.trans_id = t2.trans_id FOR JSON PATH
  ) items, 
  (select 
  receipt_id, trans_id, modified_date, filename
  from foodmgmt.dbo.bm_receipts t3
  where t1.trans_id = t3.trans_id FOR JSON PATH
  ) receipt,
  (select sum(amount) 
  from foodmgmt.dbo.bm_cashflow where 
  foodmgmt.dbo.bm_cashflow.trans_id = t1.trans_id group by trans_id) total 
  from foodmgmt.dbo.bm_transaction t1 `; //order by transdate desc
  const { searchParams } = new URL(req.url);
  let transIdStr = searchParams.get("transid");
  if (transIdStr !== null) {
    let transId = parseInt(transIdStr);
    if (!isNaN(transId)) {
      sqlStatement += " where t1.trans_id = @transid ";
      sqlReq.input("transid", transId);
    }
  }
  sqlStatement += " order by transdate desc";
  let transResult = await sqlReq.query(sqlStatement);
  let transactions: Array<Transaction> = transResult.recordset;
  transactions.forEach((i) => {
    if (typeof i.items === "string") {
      i.items = JSON.parse(i.items);
    }
    if (typeof i.receipt === "string") {
      i.receipt = JSON.parse(i.receipt)[0];
    }
  });
  return NextResponse.json(transactions);
}

export async function PUT(req: NextRequest) {
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
    if (file !== undefined && file !== null) {
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
