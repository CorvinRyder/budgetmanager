import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/db";
import getTransactions from "./getTransaction";
import sql from "mssql";
import moment from "moment";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const transIdStr = searchParams.get("transid");
  const yearmonth = searchParams.get("yearmonth");
  let transId = undefined;
  if (transIdStr !== null) {
    transId = parseInt(transIdStr);
    if (isNaN(transId)) {
      return NextResponse.json(
        { message: "Wrong transaction ID type!" },
        { status: 400 }
      );
    }
  }
  let dateParsedDate = undefined;
  if (yearmonth !== null) {
    const dateParsed = moment.utc(yearmonth);
    if (!dateParsed.isValid())
      return NextResponse.json({ message: "Wrong date!" }, { status: 400 });
    dateParsedDate = dateParsed.toDate();
  }
  return NextResponse.json(await getTransactions(transId, dateParsedDate));
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
      "DELETE FROM dbo.bm_cashflow WHERE trans_id = @trans_id"
    );
  }

  const table = new sql.Table("bm_cashflow");
  table.columns.add("trans_id", sql.Int, { nullable: false });
  table.columns.add("amount", sql.Money, { nullable: true });
  table.columns.add("item", sql.NVarChar, { nullable: false });
  table.columns.add("category", sql.VarChar, { nullable: false });
  table.columns.add("remark", sql.NVarChar);

  transData.items.forEach((i) => {
    table.rows.add(transId, i.amount, i.item, i.category, i.remark);
  });

  return sqlReq.bulk(table);
}

export async function PUT(req: NextRequest) {
  const transData: Transaction = await req.json();

  if (!transData) return NextResponse.error();

  if (transData.items.length === 0) return NextResponse.error();

  const pool = await connectToDatabase();
  const trans = pool.transaction();
  await trans.begin();
  try {
    const sqlReq = trans.request();
    sqlReq.input("trandate", transData.transdate);
    sqlReq.input("store", transData.store);
    sqlReq.input("location", transData.location);
    sqlReq.input("isdraft", transData.isdraft && "T");
    const transId: number = (
      await sqlReq.query(
        "INSERT INTO dbo.bm_transaction(transdate, store, location, isdraft) output inserted.trans_id VALUES(@trandate, @store, @location, @isdraft);"
      )
    ).recordset[0]["trans_id"];
    console.debug(transId);

    await updateCashflow(sqlReq, transId, transData);

    if (transData.receipt) {
      sqlReq.input("transId", transId);
      sqlReq.input("receiptId", transData.receipt.receipt_id);
      await sqlReq.query(
        "UPDATE dbo.bm_receipts set trans_id = @transID where receipt_id = @receiptId"
      );
    }

    await trans.commit();
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.debug(err);
    await rollbackTrans(trans);
    return NextResponse.json(
      { message: err },
      { status: 500 } // 👈 Set HTTP status code
    );
  } finally {
    pool.close();
  }
}

export async function POST(req: NextRequest) {
  const transData: Transaction = await req.json();

  if (!transData || transData.trans_id === undefined)
    return NextResponse.json(
      { message: "Transaction not found!" },
      { status: 404 }
    );

  if (transData.items.length === 0)
    return NextResponse.json(
      { message: "Incorrect parameter!" },
      { status: 400 }
    );

  const pool = await connectToDatabase();
  const trans = pool.transaction();
  await trans.begin();
  try {
    const sqlReq = trans.request();
    sqlReq.input("trans_id", transData.trans_id);
    sqlReq.input("transdate", transData.transdate);
    sqlReq.input("store", transData.store);
    sqlReq.input("location", transData.location);
    sqlReq.input("isdraft", transData.isdraft ? "T" : null);
    const updateResult = await sqlReq.query(`
    UPDATE dbo.bm_transaction
    SET transdate=@transdate, store=@store, location=@location, isdraft=@isdraft
    WHERE trans_id=@trans_id;`);
    if (updateResult.rowsAffected[0] === 0) {
      return NextResponse.json(
        { message: "Transaction record not found!" },
        { status: 404 } // 👈 Set HTTP status code
      );
    }

    await updateCashflow(trans.request(), transData.trans_id, transData, true);

    if (transData.receipt) {
      sqlReq.input("transId", transData.trans_id);
      sqlReq.input("receiptId", transData.receipt.receipt_id);
      await sqlReq.query(
        "UPDATE dbo.bm_receipts set trans_id = @transID where receipt_id = @receiptId"
      );
    }

    await trans.commit();
    return NextResponse.json(
      { message: "OK" },
      { status: 200 } // 👈 Set HTTP status code
    );
  } catch (err) {
    console.debug(err);
    await rollbackTrans(trans);
    return NextResponse.json(
      { message: err },
      { status: 500 } // 👈 Set HTTP status code
    );
  } finally {
    pool.close();
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const transIdStr = searchParams.get("transid");

  if (transIdStr === null)
    return NextResponse.json(
      { message: "Incorrect parameter!" },
      { status: 400 }
    );

  const transId = parseInt(transIdStr);

  if (isNaN(transId))
    return NextResponse.json(
      { message: "Incorrect parameter!" },
      { status: 400 }
    );

  const pool = await connectToDatabase();
  const trans = pool.transaction();
  try {
    await trans.begin();
    const sqlReq = trans.request();

    sqlReq.input("transid", transId);

    const deleteResult = await sqlReq.query(
      "UPDATE bm_transaction set deleted = 'T' where trans_id = @transid"
    );
    if (deleteResult.rowsAffected[0] === 0)
      return NextResponse.json(
        { message: "Tranaction record not found!" },
        { status: 404 }
      );

    await sqlReq.query(
      "UPDATE bm_cashflow set deleted = 'T' where trans_id = @transid"
    );
    await sqlReq.query(
      "UPDATE bm_receipts set deleted = 'T' where trans_id = @transid"
    );

    await trans.commit();

    return NextResponse.json(
      { message: "Transaction deleted" },
      { status: 200 }
    );
  } catch (err) {
    await rollbackTrans(trans);
    return NextResponse.json({ message: err }, { status: 500 });
  } finally {
    pool.close();
  }
}

async function rollbackTrans(trans: sql.Transaction) {
  try {
    await trans.rollback();
  } catch {}
}
