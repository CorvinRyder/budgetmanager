import { connectToDatabase } from "@/db";
import sql from "mssql";

export default function getTransactions(
  transId?: number,
  month?: Date
): Promise<Array<Transaction>> {
  return new Promise(async (resolve) => {
    const pool = await connectToDatabase();
    const trans = pool.transaction();
    await trans.begin();
    const sqlReq = trans.request();
    let sqlStatement = `
    select t1.trans_id, transdate, store, location, isdraft, sale_tax,
    (select 
    cashflow_id, t2.trans_id, amount, item, category, remark 
    from dbo.bm_cashflow t2 
    where t1.trans_id = t2.trans_id FOR JSON PATH
    ) items, 
    (select 
    receipt_id, trans_id, modified_date, filename
    from dbo.bm_receipts t3
    where t1.trans_id = t3.trans_id FOR JSON PATH
    ) receipt,
    (select cast(sum(amount) as numeric(5,2))
    from dbo.bm_cashflow where 
    dbo.bm_cashflow.trans_id = t1.trans_id group by trans_id) total 
    from dbo.bm_transaction t1`;
    if (transId !== undefined) {
      sqlStatement += " where t1.trans_id = @transid and deleted is null";
      sqlReq.input("transid", transId);
    } else {
      if (month === undefined) month = new Date();
      sqlReq.input("yearmonth", sql.DateTime, month);
      sqlStatement +=
        " where transdate between datetrunc(MONTH, @yearmonth) and dateadd(Month, 1, datetrunc(MONTH, @yearmonth))-0.00001";
    }
    sqlStatement += "  and deleted is null";
    if (!transId) sqlStatement += " or (isdraft = 'T' and deleted is null)";
    sqlStatement += " order by isdraft desc, transdate desc";
    const transResult = await sqlReq.query(sqlStatement);
    const transactions: Array<Transaction> = transResult.recordset;
    transactions.forEach((i) => {
      if (typeof i.items === "string") {
        i.items = JSON.parse(i.items);
      }
      if (typeof i.receipt === "string") {
        i.receipt = JSON.parse(i.receipt)[0];
      }
    });
    pool.close();
    resolve(transactions);
  });
}
