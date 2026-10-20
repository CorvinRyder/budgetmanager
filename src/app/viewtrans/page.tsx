"use client";

import AlertDialog from "@/components/AlertDialog";
import moment from "moment";
import { useEffect, useState, useRef } from "react";
import TooltipSpan from "@/components/TooltipSpan";
import Link from "next/link";
import SpendingByCategory from "./charts/SpendingByCategory";
import DailySpendingTrend from "./charts/DailySpendingTrend";
import TopFiveSpending from "./charts/TopFiveSpending";
import { Button, TextField } from "@mui/material";
import TaggingUI from "./TaggingUI";
import RatingWidget from "@/components/RatingWidget";

export default function ViewTrans() {
  const cachedTransactions = useRef<Transaction[]>([]);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date());
  const [updateKey, setUpdateKey] = useState(Date.now());
  const [dialogParams, setDialogParams] = useState<AlertDialogParams>(
    {} as AlertDialogParams
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMode, setActiveMode] = useState("monthly"); // 'monthly' | 'tags' | 'journey'
  const [trans, setTrans] = useState<Array<Transaction>>([]);
  const [tagList, setTagList] = useState<Array<Tag>>([]);
  const [tag, setTag] = useState<Tag>();

  useEffect(() => {
    setLoading(true);

    const reqUrl =
      activeMode === "monthly"
        ? `/api/Transaction?yearmonth=${moment(month).format("YYYY-MM-DD")}`
        : activeMode === "tags"
        ? `/api/Transaction?tag=${tag?.tag_id}`
        : activeMode === "journey"
        ? `/api/Transaction?yearmonth=${moment(month).format("YYYY-MM-DD")}`
        : undefined;

    if (typeof reqUrl === "undefined") return;

    fetch(reqUrl).then(async (r) => {
      if (r.status === 500) {
        setIsError(true);
      } else {
        const trans: Transaction[] = await r.json();
        cachedTransactions.current = trans;
        setTrans(filterTrans);
        setLoading(false);
      }
    });
  }, [updateKey, month, tag, activeMode]);

  useEffect(() => {
    (async () => {
      const resp = await fetch("/api/Tags", { method: "GET" });
      const tags: Array<Tag> = await resp.json();
      setTagList(tags.sort((a, b) => a.tag_name.localeCompare(b.tag_name)));
      if (tags.length > 0) setTag(tags[0]);
    })();
  }, []);

  const filterTrans = () =>
    searchTerm === ""
      ? cachedTransactions.current
      : cachedTransactions.current.filter(
          (i) =>
            i.store.toLowerCase().indexOf(searchTerm) > -1 ||
            (i.items &&
              i.items.some(
                (j) => j.item.toLowerCase().indexOf(searchTerm) > -1
              ))
        );

  useEffect(() => {
    setTrans(filterTrans());
  }, [searchTerm]);

  const updateTags = async function (transId: number, tags: Array<Tag>) {
    await fetch("/api/Tags", {
      method: "PUT",
      body: JSON.stringify({ transId, tags }),
    });
    const trans = cachedTransactions.current.find(
      (i) => i.trans_id === transId
    );
    if (!trans) {
      console.debug("TRANS not found");
      return;
    }
    trans.tags = tags;
    setTrans([...cachedTransactions.current]);
  };

  const showTaggingWindow = function (transId: number, isSave: boolean) {
    setDialogParams({
      open: true,
      title: "Tag Transaction",
      jsx: (
        <TaggingUI
          isSave={isSave}
          onReadyToClose={(tags) => updateTags(transId, tags)}
        />
      ),
      OnDialogOk() {
        showTaggingWindow(transId, true);
        setTimeout(() => setDialogParams({ open: false }), 200);
      },
      OnDialogCancel() {},
    });
  };

  return (
    <div className="flex flex-col h-full p-2 gap-2">
      <AlertDialog params={dialogParams} />
      <div className="inline-flex items-center gap-2 p-1.5 bg-slate-200/80 border-2 border-slate-300">
        {/* 1. Monthly Spending Mode */}
        <button
          onClick={() => setActiveMode("monthly")}
          className={`group relative flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out ${
            activeMode === "monthly"
              ? "bg-teal-100 text-teal-800 border-teal-300 shadow-sm border "
              : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
          }`}
        >
          <span className="material-symbols-outlined shrink-0 transition-transform group-hover:scale-110">
            calendar_month
          </span>
          <span
            className={`hidden overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ml-2 ${
              activeMode === "monthly" ? "md:block" : "md:hidden"
            }`}
          >
            Monthly Spending
          </span>
        </button>

        {/* 2. Tag Insights Mode */}
        <button
          onClick={() => setActiveMode("tags")}
          className={`group relative flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out ${
            activeMode === "tags"
              ? "bg-sky-100 text-sky-800 border-sky-300 shadow-sm border"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
          }`}
        >
          <span className="material-symbols-outlined shrink-0 transition-transform group-hover:scale-110">
            tag
          </span>
          <span
            className={`hidden overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ml-2 ${
              activeMode === "tags" ? "md:block" : "md:hidden"
            }`}
          >
            Tag Insights
          </span>
        </button>

        {/* 3. Spending Journey Mode */}
        <button
          onClick={() => setActiveMode("journey")}
          className={`group relative flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out ${
            activeMode === "journey"
              ? "bg-amber-100 text-amber-800 border-amber-300 shadow-sm border"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
          }`}
        >
          <span className="material-symbols-outlined shrink-0 transition-transform group-hover:scale-110">
            star_half
          </span>
          <span
            className={`hidden overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ml-2 ${
              activeMode === "journey" ? "md:block" : "md:hidden"
            }`}
          >
            Spending Journey
          </span>
        </button>

        {/* Dynamic Contextual Filter Controls Area */}
        <div className="flex items-center gap-2 pl-3 ml-1 border-l border-slate-800">
          {activeMode === "monthly" && (
            <div className="flex-1 flex items-center justify-center">
              <div
                className="hidden md:flex bg-cyan-500 hover:bg-cyan-600 text-white p-2  font-medium shadow items-center cursor-pointer"
                onClick={() => {
                  setMonth(moment(month).add(-1, "months").toDate());
                }}
                // disabled={loading}
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </div>
              <input
                type="month"
                onChange={(e) => {
                  const month = e.target.value;
                  setMonth(moment(month).toDate());
                }}
                value={moment(month).format("YYYY-MM")}
                className="px-2.5 py-1 text-lg font-medium bg-white text-slate-800 border border-slate-300 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all shadow-sm"
              />
              <div
                className="bg-cyan-500 hover:bg-cyan-600 text-white p-2 font-medium shadow hidden md:flex items-center cursor-pointer"
                onClick={() => {
                  setMonth(moment(month).add(1, "months").toDate());
                }}
                // disabled={loading}
              >
                <span className="material-symbols-outlined">arrow_forward</span>
              </div>
            </div>
          )}

          {activeMode === "tags" && (
            <select
              onChange={(e) => {
                const id = parseInt(e.target.value);
                if (isNaN(id)) return;
                const tagObj = tagList.find((i) => i.tag_id === id);
                setTag(tagObj);
              }}
              className="px-2.5 py-1 text-lg font-medium bg-white text-slate-700 border border-slate-700/60 rounded-md focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
            >
              {tagList.map((i, j) => (
                <option key={j} value={i.tag_id}>
                  #{i.tag_name}
                </option>
              ))}
            </select>
          )}

          {activeMode === "journey" && (
            <select className="px-2.5 py-1 text-lg font-medium bg-white text-slate-700 border border-slate-700/60 rounded-md focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all">
              <option value="all">All Rated & Notes</option>
              <option value="5star">5 Stars (High Value)</option>
              <option value="regrets">1-2 Stars (Regrets)</option>
            </select>
          )}
        </div>

        <div className="flex items-center gap-2 pl-3 ml-1 border-l border-slate-800">
          <div className="flex-1 hidden md:flex">
            <TextField
              placeholder="🔎 Search for item name, store name..."
              className="w-full border-cyan-500 focus:ring-cyan-500"
              defaultValue={searchTerm}
              onBlur={(e) => setSearchTerm(e.target.value)}
              key={searchTerm}
            />
            <Button variant="outlined" onClick={() => setSearchTerm("")}>
              ❌
            </Button>
          </div>
        </div>
      </div>
      <div className="flex w-full md:h-3/12 gap-2">
        <div className="hidden md:block flex-1 bg-slate-200/60 border-2 border-slate-300">
          <SpendingByCategory updateKey={updateKey} month={month} />
        </div>
        <div className="hidden md:block flex-1 bg-slate-200/60 border-2 border-slate-300">
          <DailySpendingTrend
            data={trans}
            updateKey={updateKey}
            month={month}
          />
        </div>
        <div className="hidden md:block flex-1 bg-slate-200/60 border-2 border-slate-300">
          <TopFiveSpending data={trans} />
        </div>
      </div>
      <div className="p-2 h-full md:h-9/12 bg-white shadow-md border border-slate-200 overflow-y-auto">
        {loading ? (
          <div style={{ textAlign: "center" }}>
            <span className="Loading material-symbols-outlined">sync</span>
            Loading transaction...
          </div>
        ) : isError ? (
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
                    {i.tags && (
                      <div className="flex flex-col gap-1 items-start text-xs font-mono ">
                        {i.tags.map((j, k) => (
                          <div key={k} className="bg-blue-200 p-1 rounded-md">
                            #{j.tag_name}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-col gap-1 items-start text-xs font-mono">
                      <div
                        className="bg-cyan-500 p-1 rounded-md text-white cursor-pointer"
                        onClick={() =>
                          showTaggingWindow(i.trans_id || 0, false)
                        }
                      >
                        ➕ Tags
                      </div>
                    </div>
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
                  <td>
                    {i.total && "$" + Math.abs(i.total).toFixed(2)}
                    <RatingWidget
                      transaction={i}
                      onChange={(newTrans) => {
                        const newArr = [...trans];
                        newArr[j] = newTrans;
                        setTrans(newArr);
                      }}
                    />
                  </td>
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
