import CheckUser from "@/utils/CheckUser";
import EditTransPage from "../addtrans/TransEditForm";
import getTransactions from "../api/Transaction/getTransaction";
import { headers } from "next/headers";
import { Suspense } from "react";

const LoadEditpage = async ({
  transid,
  userId,
}: {
  transid: string;
  userId: string;
}) => {
  let curTrans = undefined;
  if (transid) {
    const transId = parseInt(transid as string);
    if (!isNaN(transId)) {
      const trans = await getTransactions(userId, parseInt(transid));
      if (trans.length > 0) curTrans = trans[0];
    }
  }

  return <EditTransPage trans={curTrans} />;
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const userId = await CheckUser(undefined, await headers());
  if (!userId) return <div>Unauthorized Access!</div>;

  const transid = (await searchParams)["transid"] as string;

  return (
    <Suspense
      fallback={
        <div className="h-full mx-auto my-auto w-64">
          <span className="material-symbols-outlined text-5xl! align-middle animate-spin">
            sync
          </span>{" "}
          <span className="text-2xl">Loading Data...</span>
        </div>
      }
    >
      <LoadEditpage userId={userId} transid={transid} />
    </Suspense>
  );
}
