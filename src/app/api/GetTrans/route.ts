import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/db";

export async function GET(req: NextRequest) {
  let pool = await connectToDatabase();
  var trans = pool.transaction();
  await trans.begin();
  let sqlReq = trans.request();
  let transResult = await sqlReq.query(`
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
  from foodmgmt.dbo.bm_transaction t1`);
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
