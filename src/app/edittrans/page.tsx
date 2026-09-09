import EditTransPage from "../addtrans/TransEditForm";
import getTransactions from "../api/Transaction/getTransaction";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const transid = (await searchParams)["transid"] as string;
  let curTrans = undefined;
  if (transid) {
    const transId = parseInt(transid as string);
    if (!isNaN(transId)) {
      const trans = await getTransactions(parseInt(transid));
      if (trans.length > 0) curTrans = trans[0];
    }
  }

  return <EditTransPage trans={curTrans} />;
}
