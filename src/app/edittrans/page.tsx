import EditTransPage from "../addtrans/page";
import { getTransactions } from "../api/Transaction/route";

export default async function Page({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  let curTrans = undefined;
  searchParams = await searchParams;
  if (searchParams?.transid) {
    let transId = parseInt(searchParams?.transid as string);
    if (!isNaN(transId)) {
      let queryResult = await getTransactions(transId);
      curTrans = queryResult?.[0];
    }
  }
  return <EditTransPage trans={curTrans} />;
}
