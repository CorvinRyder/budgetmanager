"use client";

import AlertDialog from "@/components/AlertDialog";
import moment from "moment";
import { useEffect, useState } from "react";
import TooltipSpan from "@/components/TooltipSpan";
import Link from "next/link";
import SpendingByCategory from "./charts/SpendingByCategory";
import DailySpendingTrend from "./charts/DailySpendingTrend";
import TopFiveSpending from "./charts/TopFiveSpending";
import { useRouter } from "next/navigation";

export default function ViewTrans() {
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date());
  const [updateKey, setUpdateKey] = useState(Date.now());
  const [dialogParams, setDialogParams] = useState<AlertDialogParams>(
    {} as AlertDialogParams
  );
  const [trans, setTrans] = useState<Array<Transaction>>([]);
  useEffect(() => {
    setLoading(true);
    fetch(`/api/Transaction?yearmonth=${moment(month).format("YYYY-MM-DD")}`, {
      method: "GET",
    }).then(async (r) => {
      setTrans((await r.json()) as Transaction[]);
      setLoading(false);
    });
  }, [updateKey, month]);

  const router = useRouter();

  return (
    <div className="gap-4 p-4 flex flex-col h-full ">
      <AlertDialog params={dialogParams} />
      <div className="flex w-full md:h-3/12 gap-4 ">
        <div className="hidden md:block flex-2 bg-slate-200/60 border-2 border-slate-300 rounded-xl">
          <SpendingByCategory updateKey={updateKey} month={month} />
        </div>
        <div className="hidden md:block flex-2 bg-slate-200/60 border-2 border-slate-300 rounded-xl">
          <DailySpendingTrend
            data={trans}
            updateKey={updateKey}
            month={month}
          />
        </div>
        <div className="hidden md:block flex-2 bg-slate-200/60 border-2 border-slate-300 rounded-xl">
          <TopFiveSpending data={trans} />
        </div>
        <div className="flex-1 bg-slate-200/60 border-2 border-slate-300 rounded-xl text-center flex flex-col size-full py-2 px-4 gap-4">
          <div className="flex md:flex-col flex-row gap-4">
            <div className="flex-1 flex items-center justify-center">
              <button
                className="bg-cyan-400 text-black p-4 rounded-xl font-medium shadow hover:bg-cyan-500"
                onClick={() => {
                  setMonth(moment(month).add(-1, "months").toDate());
                }}
                disabled={loading}
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div className="text-xl font-bold mx-3">
                {moment(month).format("YYYY-MM")}
              </div>
              <button
                className="bg-cyan-400 text-black p-4 rounded-xl font-medium shadow hover:bg-cyan-500"
                onClick={() => {
                  setMonth(moment(month).add(1, "months").toDate());
                }}
                disabled={loading}
              >
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
            <button
              className="flex-1 bg-cyan-400 text-black p-4 rounded-xl font-medium shadow hover:bg-cyan-500"
              onClick={() => router.push("/addtrans")}
            >
              New Receipt
            </button>
          </div>
        </div>
      </div>
      <div className="p-2 h-full md:h-9/12 bg-white rounded-2xl shadow-md border border-slate-200 overflow-auto">
        {loading ? (
          <div style={{ textAlign: "center" }}>
            <span className="Loading material-symbols-outlined">sync</span>
            Loading transaction...
          </div>
        ) : (
          <table className="stable-auto w-full">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr className="text-left text-sm font-semibold text-slate-900">
                <th className="py-4">Date</th>
                <th className="py-4">Location</th>
                <th className="py-4">Receipt</th>
                <th className="py-4">Items</th>
                <th className="py-4">Total</th>
                <th className="py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trans.map((i, j) => (
                <tr
                  key={j}
                  className="border-b border-slate-200 hover:bg-slate-50 p-4 text-sm text-slate-700"
                >
                  <td>
                    {moment(i.transdate).format("MM-DD HH:mm")}
                    {i.isdraft && (
                      <div>
                        <span className="material-symbols-outlined align-middle">
                          draft
                        </span>{" "}
                        Draft
                      </div>
                    )}
                  </td>
                  <td>
                    {i.location ? (
                      <a
                        href={
                          i.location.startsWith("http")
                            ? i.location
                            : `https://www.google.com/maps/place/${i.location}`
                        }
                        target="_blank"
                      >
                        <span className="material-symbols-outlined align-middle">
                          map
                        </span>
                        {i.store}
                      </a>
                    ) : (
                      i.store
                    )}
                  </td>
                  <td>
                    {i.receipt && (
                      <a
                        href={`/receipts/${i.receipt.filename}`}
                        target="_blank"
                      >
                        <span className="material-symbols-outlined align-middle">
                          receipt_long
                        </span>{" "}
                        Receipt
                      </a>
                    )}
                  </td>
                  <td className="py-3">
                    {i.items &&
                      i.items.map((k, l) => (
                        <div key={l}>
                          <TooltipSpan tooltip={k.remark}>
                            {k.item} (${k.amount})
                          </TooltipSpan>
                        </div>
                      ))}
                  </td>
                  <td>{i.total && "$" + Math.abs(i.total).toFixed(2)}</td>
                  <td>
                    <Link href={`/edittrans?transid=${i.trans_id}`}>
                      <span className="material-symbols-outlined ActionBtn">
                        edit
                      </span>
                    </Link>
                    <a
                      onClick={() => {
                        setDialogParams({
                          open: true,
                          title: "Delete Transaction",
                          content:
                            "Are you sure to delete this transaction? It can't be undone!",
                          async OnDialogOk() {
                            setDialogParams({
                              open: true,
                              title: "Saving the Transaction Record",
                              jsx: (
                                <div>
                                  <span className="Loading material-symbols-outlined">
                                    sync
                                  </span>
                                  Deleting the transaction record from the
                                  database...
                                </div>
                              ),
                              noOkButton: true,
                            });
                            await fetch(
                              "/api/Transaction?transid=" + i.trans_id,
                              {
                                method: "DELETE",
                              }
                            );
                            setDialogParams({
                              open: false,
                            });
                            setUpdateKey(Date.now());
                          },
                          OnDialogCancel() {},
                        });
                      }}
                    >
                      <span className="material-symbols-outlined ActionBtn">
                        delete
                      </span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
