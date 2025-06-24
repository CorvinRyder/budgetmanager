import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/db";
import moment from "moment";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const yearmonth = searchParams.get("date");
  let dateParsedDate = undefined;
  const dateParsed = moment(yearmonth);
  if (!dateParsed.isValid())
    return NextResponse.json({ message: "Wrong date!" }, { status: 400 });
  dateParsedDate = dateParsed.toDate();

  const pool = await connectToDatabase();
  const trans = pool.transaction();
  await trans.begin();
  const sqlReq = trans.request();
  sqlReq.input("yearmonth", dateParsedDate);
  const result = await sqlReq.query(`
		select category, t1.amount, bb.amount as allowance,(t1.amount / bb.amount) as rate from (
		select category, sum(amount) as amount
		from bm_cashflow bc 
		inner join bm_transaction bt on bc.trans_id = bt.trans_id
		where bt.transdate 
		between datetrunc(MONTH, CAST(@yearmonth as datetime)) and 
		dateadd(Month, 1, datetrunc(MONTH, cast(@yearmonth as datetime)))-1
		and bt.deleted is null
		group by category) t1
		left join bm_budgetplanitems bb on t1.category = bb.item`);
  return NextResponse.json(
    result.recordset,
    { status: 200 } // 👈 Set HTTP status code
  );
}
