import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/db";
import moment from "moment";
import CheckUser from "@/utils/CheckUser";

export async function GET(req: NextRequest) {
  const userId = await CheckUser(req);
  if (!userId) return NextResponse.json("", { status: 401 });

  const { searchParams } = new URL(req.url);
  const yearmonth = searchParams.get("date");
  let dateParsedDate = undefined;
  const dateParsed = moment.utc(yearmonth);
  if (!dateParsed.isValid())
    return NextResponse.json({ message: "Wrong date!" }, { status: 400 });
  dateParsedDate = dateParsed.toDate();

  const result = await (await connectToDatabase())
    .request()
    .input("yearmonth", dateParsedDate)
    .input("userId", userId).query(`
    select bc.category , t1.amount, bb.amount as allowance, (t1.amount / bb.amount) as rate
    from (
      select category, sum(amount) as amount
      from (
        select LEFT(category, 1) as category, sum(amount) as amount
        from bm_cashflow bc 
        inner join bm_transaction bt on bc.trans_id = bt.trans_id and bt.userid = @userId
        where bt.transdate 
        between datetrunc(MONTH, CAST(@yearmonth as datetime)) and 
        dateadd(MONTH, 1, datetrunc(MONTH, cast(@yearmonth as datetime)))-0.00001
        and bt.deleted is null and isdraft is null
        group by category
      ) t2
      group by t2.category
    ) t1
    left join bm_budgetplanitems bb on t1.category = bb.item
    left join bm_categories bc on t1.category = bc.cat_code
    where bc.category is not null`);
  return NextResponse.json(
    result.recordset,
    { status: 200 } // 👈 Set HTTP status code
  );
}
