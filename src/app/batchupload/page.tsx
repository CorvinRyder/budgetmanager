"use client";

import { Button } from "@mui/material";
import moment from "moment";
import { useState } from "react";

export default function Page() {
  const [files, setFiles] = useState<File[]>([]);

  async function extractReceiptContent(file?: File, path?: string) {
    const formData = new FormData();
    if (file !== undefined) formData.append("file", file);
    else if (path !== undefined) formData.append("filepath", path);
    const readReceiptResult = await await fetch("/api/AI/ReadReceipt", {
      method: "POST",
      body: formData,
    });
    if (readReceiptResult.status !== 200) {
      return;
    }
    const receiptList: ReceiptContent = await readReceiptResult.json();
    let dateTime = moment(receiptList.date_time);
    if (!dateTime.isValid()) dateTime = moment();
    const newTrans: Transaction = {
      transdate: dateTime.toDate(),
      store: receiptList.store_name,
      location: receiptList.store_addr,
      sale_tax: receiptList.sale_tax,
      items: receiptList.items.map(
        (i) =>
          ({
            item: i.name,
            amount: i.price,
            remark: i.remark,
            category: i.category,
          } as TransItem)
      ),
    };
    return newTrans;
  }

  const startUpload = async () => {
    files.forEach(async (i) => {
      console.debug(await extractReceiptContent(i));
    });
  };

  return (
    <div className="gap-4 p-4 flex flex-col h-full">
      <div>Batch Receipts Upload</div>
      <div>
        Upload multiple receipts, let AI process all of them and save them as
        drafts in the database
      </div>
      <div className="border-2 p-2">
        <input
          type="file"
          onChange={async (evt) => {
            if (evt.target.files?.length) {
              const file = evt.target.files?.[0];
              if (file !== undefined) {
                const newFiles = ([] as File[]).concat(files);
                newFiles.push(file);
                setFiles(newFiles);
                evt.target.value = "";
              }
            }
          }}
        />
      </div>

      {files.map((i, j) => (
        <div key={j}>
          {i.name} - {(i.size / 1024).toFixed(0)}KB
        </div>
      ))}

      <div>
        <Button variant="contained" onClick={() => startUpload()}>
          <span className="material-symbols-outlined">send</span>
        </Button>
      </div>
    </div>
  );
}
