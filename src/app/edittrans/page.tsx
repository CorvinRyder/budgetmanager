"use client";

import { useEffect, useState } from "react";
import EditTransPage from "../addtrans/TransEditForm";

export default function Page() {
  const [curTrans, setCurTrans] = useState<Transaction>();
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const transid = searchParams.get("transid");
    if (transid) {
      const transId = parseInt(transid as string);
      if (!isNaN(transId)) {
        fetch("/api/Transaction?transid=" + transId, {
          method: "GET",
        }).then(async (r) => {
          const transJson = (await r.json()) as Transaction[];
          setCurTrans(transJson[0]);
        });
      }
    }
  }, []);
  return curTrans ? (
    <EditTransPage trans={curTrans} />
  ) : (
    <div>
      <span className="Loading material-symbols-outlined">sync</span>
      Loading the old transaction...
    </div>
  );
}
