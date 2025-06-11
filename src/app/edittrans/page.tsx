import EditTransPage from "../addtrans/page";
import getTransactions from "../api/Transaction/getTransaction";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  let curTrans = undefined;
  const { transid } = await searchParams;
  if (transid) {
    const transId = parseInt(transid as string);
    if (!isNaN(transId)) {
      const queryResult = await getTransactions(transId);
      curTrans = queryResult?.[0];
    }
  }
  return <EditTransPage trans={curTrans} />;
}
