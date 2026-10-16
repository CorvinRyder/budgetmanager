"use client";

import ComboBox from "@/components/ComboBox";
import TooltipSpan from "@/components/TooltipSpan";
import moment from "moment";
import { useEffect, useState } from "react";

export default function TagTrans() {
  const [loading, setLoading] = useState(true);
  // const [isError, setIsError] = useState(false);
  const [tagList, setTagList] = useState<Array<Tag>>([]);
  const [tag, setTag] = useState<Tag>();
  const [trans, setTrans] = useState<Array<Transaction>>([]);
  const [updateKey, setUpdateKey] = useState(Date.now());

  useEffect(() => {
    (async () => {
      const resp = await fetch("/api/Tags", { method: "GET" });
      const tags: Array<Tag> = await resp.json();
      setTagList(tags);
      if (tags.length > 0) setTag(tags[0]);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!tag) return;
      setLoading(true);
      const resp = await fetch("/api/Transaction?tag=" + tag?.tag_id);
      const trans: Array<Transaction> = await resp.json();
      setTrans(trans);
      setLoading(false);
    })();
  }, [tag, updateKey]);

  return (
    <div className="flex flex-col h-full p-2 gap-2">
      <div className="flex-1 bg-slate-100 text-center flex size-full gap-4 text-slate-900">
        <div className="flex-1 hidden md:flex">
          {/* <TextField
            placeholder="🔎 Search for item name, store name..."
            className="w-full border-cyan-500 focus:ring-cyan-500"
            defaultValue={searchTerm}
            onBlur={(e) => setSearchTerm(e.target.value)}
            key={searchTerm}
          />
          <Button variant="outlined" onClick={() => setSearchTerm("")}>
            ❌
          </Button> */}
          <ComboBox<Tag>
            className="w-full border-cyan-500 focus:ring-cyan-500"
            displayValue="tag_name"
            options={tagList}
            label="Select Tag"
            allowNewValue={false}
            value={tag}
            onChange={(newV) => setTag(newV)}
          />
        </div>
        <div className="flex-1 hidden md:flex items-center justify-center">
          {/* <div
            className="bg-cyan-500 hover:bg-cyan-600 text-white p-2  font-medium shadow flex items-center cursor-pointer"
            onClick={() => {
              setMonth(moment(month).add(-1, "months").toDate());
            }}
            // disabled={loading}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </div>
          <div className="text-lg font-bold mx-3 flex items-center">
            {moment(month).format("YYYY-MM")}
          </div>
          <div
            className="bg-cyan-500 hover:bg-cyan-600 text-white p-2 font-medium shadow flex items-center cursor-pointer"
            onClick={() => {
              setMonth(moment(month).add(1, "months").toDate());
            }}
            // disabled={loading}
          >
            <span className="material-symbols-outlined">arrow_forward</span>
          </div> */}
        </div>
        <div className="flex-1 flex justify-end gap-2 p-2 ">
          {/* <div
            className="bg-cyan-500 hover:bg-cyan-600 text-white p-2 font-medium shadow hidden md:flex cursor-pointer"
            onClick={() => router.push("/addtrans")}
          >
            <span className="material-symbols-outlined">add</span>
            <span>New Receipt</span>
          </div> */}
        </div>
      </div>
      <div className="p-2 h-full bg-white shadow-md border border-slate-200 overflow-auto">
        {loading ? (
          <div style={{ textAlign: "center" }}>
            <span className="Loading material-symbols-outlined">sync</span>
            Loading transaction...
          </div>
        ) : false ? (
          <div>Cannot load the transaction data!</div>
        ) : (
          <table className="stable-auto w-full">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr className="text-left text-sm font-semibold text-slate-900">
                <th className="py-4">Date</th>
                <th className="py-4">Location</th>
                <th className="py-4">Receipt</th>
                <th className="py-4">Items</th>
                <th className="py-4">Total</th>
                {/* <th className="py-4">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {trans.map((i, j) => (
                <tr
                  key={j}
                  className="border-b border-slate-200 hover:bg-slate-50 p-4 text-sm text-slate-700"
                >
                  <td>
                    {moment(i.transdate).format("yyyy-MM-DD HH:mm")}
                    {i.tags && (
                      <div className="flex flex-col gap-1 items-start text-xs font-mono ">
                        {i.tags.map((j, k) => (
                          <div
                            key={k}
                            className="bg-blue-200 p-1 rounded-md flex gap-3"
                          >
                            <div>#{j.tag_name}</div>
                            <div
                              className="cursor-pointer"
                              onClick={async () => {
                                setLoading(true);
                                await fetch("/api/Tags", {
                                  method: "DELETE",
                                  body: JSON.stringify({
                                    transId: i.trans_id,
                                    tags: [j],
                                  }),
                                });
                                setUpdateKey(Date.now());
                              }}
                            >
                              ❌
                            </div>
                          </div>
                        ))}
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
                  {/* <td>
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
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
