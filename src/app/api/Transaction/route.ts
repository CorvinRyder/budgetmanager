import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/db";
import sql from "mssql";
import fs from "fs/promises";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let transIdStr = searchParams.get("transid");
  let transId = undefined;
  if (transIdStr !== null) {
    transId = parseInt(transIdStr);
    if (isNaN(transId)) {
      return NextResponse.json(
        { message: "Wrong transaction ID type!" },
        { status: 500 } // 👈 Set HTTP status code
      );
    }
  }
  return NextResponse.json(await getTransactions(transId));
}

export function getTransactions(transId?: number): Promise<Array<Transaction>> {
  return new Promise(async (resolve) => {
    let pool = await connectToDatabase();
    var trans = pool.transaction();
    await trans.begin();
    let sqlReq = trans.request();
    let sqlStatement = `
    select t1.trans_id, transdate, location, sale_tax,
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
    if (transId !== undefined) {
      sqlStatement += " where t1.trans_id = @transid ";
      sqlReq.input("transid", transId);
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
    resolve(transactions);
  });
}

async function updateCashflow(
  sqlReq: sql.Request,
  transId: number,
  transData: Transaction,
  deleteFirst?: boolean
) {
  if (deleteFirst) {
    sqlReq.input("trans_id", transId);
    await sqlReq.query(
      "DELETE FROM foodmgmt.dbo.bm_cashflow WHERE trans_id = @trans_id"
    );
  }

  const table = new sql.Table("bm_cashflow");
  table.columns.add("trans_id", sql.Int, { nullable: false });
  table.columns.add("amount", sql.Money, { nullable: false });
  table.columns.add("item", sql.NVarChar, { nullable: false });
  table.columns.add("category", sql.VarChar, { nullable: false });
  table.columns.add("remark", sql.NVarChar);

  transData.items.forEach((i) => {
    table.rows.add(transId, i.amount, i.item, i.category, i.remark);
  });

  return sqlReq.bulk(table);
}

async function saveReceiptFile(
  file: File,
  transId: number,
  sqlReq: sql.Request,
  deleteOld?: boolean
) {
  if (deleteOld) {
    sqlReq.input("trans_id", transId);
    await sqlReq.query(
      "UPDATE foodmgmt.dbo.bm_receipts SET deleted = 'T' WHERE trans_id = @trans_id;"
    );
  }

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
  if (!deleteOld) sqlReq.input("trans_id", transId);
  sqlReq.input("filename", fileName);
  return sqlReq.query(
    "INSERT INTO foodmgmt.dbo.bm_receipts(trans_id, modified_date, filename) VALUES (@trans_id, getDate(), @filename);"
  );
}

export async function PUT(req: NextRequest) {
  const formData = await req.formData();

  if (formData.get("transdata") === undefined) return NextResponse.error();

  const transData: Transaction = JSON.parse(
    formData.get("transdata") as string
  );

  if (transData.items.length === 0) return NextResponse.error();

  let pool = await connectToDatabase();
  var trans = pool.transaction();
  await trans.begin();
  try {
    let sqlReq = trans.request();
    sqlReq.input("trandate", transData.transdate);
    sqlReq.input("location", transData.location);
    sqlReq.input("sale_tax", transData.sale_tax);
    let transId: number = (
      await sqlReq.query(
        "INSERT INTO foodmgmt.dbo.bm_transaction(transdate, location, sale_tax) output inserted.trans_id VALUES(@trandate, @location, @sale_tax);"
      )
    ).recordset[0]["trans_id"];
    console.debug(transId);

    await updateCashflow(sqlReq, transId, transData);

    const file = formData.get("file") as File;
    if (file !== undefined && file !== null) {
      await saveReceiptFile(file, transId, sqlReq);
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

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  if (formData.get("transdata") === undefined) return NextResponse.error();

  const transData: Transaction = JSON.parse(
    formData.get("transdata") as string
  );

  if (transData.trans_id === undefined) return NextResponse.error();

  if (transData.items.length === 0) return NextResponse.error();

  let pool = await connectToDatabase();
  var trans = pool.transaction();
  await trans.begin();
  try {
    let sqlReq = trans.request();
    sqlReq.input("trans_id", transData.trans_id);
    sqlReq.input("transdate", transData.transdate);
    sqlReq.input("location", transData.location);
    sqlReq.input("sale_tax", transData.sale_tax);
    let updateResult = await sqlReq.query(`
    UPDATE foodmgmt.dbo.bm_transaction
    SET transdate=@transdate, location=@location, sale_tax=@sale_tax
    WHERE trans_id=@trans_id;`);
    if (updateResult.rowsAffected[0] === 0) {
      return NextResponse.json(
        { message: "Transaction record not found!" },
        { status: 404 } // 👈 Set HTTP status code
      );
    }

    await updateCashflow(trans.request(), transData.trans_id, transData, true);

    const file = formData.get("file") as File;
    if (file !== undefined && file !== null) {
      await saveReceiptFile(file, transData.trans_id, trans.request(), true);
    }

    await trans.commit();
    return NextResponse.json(
      { message: "OK" },
      { status: 200 } // 👈 Set HTTP status code
    );
  } catch (err) {
    console.debug(err);
    await trans.rollback();
    return NextResponse.json(
      { message: err },
      { status: 500 } // 👈 Set HTTP status code
    );
  }
}
