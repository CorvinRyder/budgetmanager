import { connectToDatabase } from "@/db";
import sql from "mssql";

export default function getTransactions(
  userId: string,
  transId?: number,
  month?: Date,
  tag?: number
): Promise<Array<Transaction>> {
  return new Promise(async (resolve) => {
    const sqlReq = (await connectToDatabase()).request();
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
    (select bt.tag_id, bt.tag_name from bm_tags bt, bm_tag_trans btt where btt.deleted is null and bt.tag_id = btt.tag_id and btt.transaction_id = t1.trans_id and bt.user_id = @userId FOR JSON PATH
    ) tags,
    (select rating, comment from bm_trans_rating br where br.trans_id = t1.trans_id FOR JSON PATH
    ) ratingInfo,     
    (select cast(sum(amount) as numeric(5,2))
    from dbo.bm_cashflow where 
    dbo.bm_cashflow.trans_id = t1.trans_id group by trans_id) total 
    from dbo.bm_transaction t1`;
    if (transId !== undefined) {
      sqlStatement += " where t1.trans_id = @transid";
      sqlReq.input("transid", transId);
    } else if (tag !== undefined) {
      sqlReq.input("tag", tag);
      sqlStatement +=
        ", dbo.bm_tag_trans btt where btt.transaction_id = t1.trans_id and btt.tag_id = @tag and btt.deleted is null";
    } else {
      if (month === undefined) month = new Date();
      sqlReq.input("yearmonth", sql.DateTime, month);
      sqlStatement +=
        " where transdate between datetrunc(MONTH, @yearmonth) and dateadd(Month, 1, datetrunc(MONTH, @yearmonth))-0.00001";
    }
    sqlStatement += " and t1.deleted is null and userid = @userId";
    sqlReq.input("userId", userId);
    if (!transId && !tag)
      sqlStatement +=
        " or (isdraft = 'T' and t1.deleted is null  and userid = @userId)";
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
      if (typeof i.tags === "string") {
        i.tags = JSON.parse(i.tags);
      }
      if (typeof i.ratingInfo === "string") {
        const obj = JSON.parse(i.ratingInfo) as Array<RatingInfo>;
        i.comment = obj[0].comment;
        i.rating = obj[0].rating;
      }
    });
    resolve(transactions);
  });
}
