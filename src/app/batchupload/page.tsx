"use client";

import { Button } from "@mui/material";
import moment from "moment";
import { useEffect, useState } from "react";

const UploadingFile = ({ file, started }: { file: File; started: boolean }) => {
  const [status, setStatus] = useState(0);

  useEffect(() => {
    if (!started) return;

    const formData = new FormData();
    if (file !== undefined) formData.append("file", file);

    setStatus(1);
    fetch("/api/UploadReceipt", {
      method: "PUT",
      body: formData,
    }).then(async (uploadResult) => {
      if (uploadResult.status !== 200) {
        setStatus(-1);
        return;
      }
      setStatus(2);
      const receiptData: Receipt = await uploadResult.json();
      const readReceiptResult = await fetch("/api/AI/ReadReceipt", {
        method: "POST",
        body: JSON.stringify(receiptData),
      });
      if (readReceiptResult.status !== 200) {
        setStatus(-2);
        return;
      }

      const receiptList: ReceiptContent = await readReceiptResult.json();
      let dateTime = moment(receiptList.date_time);
      if (!dateTime.isValid()) dateTime = moment();
      setStatus(3);
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
        isdraft: true,
        receipt: receiptList.receipt,
      };

      const saveResult = await fetch("/api/Transaction", {
        method: "PUT",
        body: JSON.stringify(newTrans),
      });

      if (saveResult.status !== 200) {
        setStatus(-3);
        return;
      }

      setStatus(4);
    });
  }, [started]);

  return (
    <div>
      {file.name} - {(file.size / 1024).toFixed(0)}KB -{" "}
      {status === 0 && "Ready"}
      {status === 1 && "Uploading"}
      {status === -1 && "Failed to Upload!"}
      {status === 2 && "AI Processing"}
      {status === -2 && "Error when analyzing with AI!"}
      {status === 3 && "Saving"}
      {status === -3 && "Unable to save the transaction!"}
      {status === 4 && "Done"}
    </div>
  );
};

export default function Page() {
  const [files, setFiles] = useState<File[]>([]);
  const [started, setStarted] = useState(false);

  const startUpload = async () => {
    setStarted(true);
  };

  return (
    <div className="flex flex-col p-4 w-full md:w-3xl h-full gap-2">
      <div className="grow-0 md:text-left text-center text-2xl font-bold">
        Batch Receipts Upload
      </div>
      <div>
        Upload multiple receipts, let AI process all of them and save them as
        drafts in the database
      </div>
      <div>
        <input
          className="border-2 p-2"
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
        <UploadingFile key={j} file={i} started={started} />
      ))}

      <div>
        <Button
          disabled={started}
          variant="contained"
          onClick={() => startUpload()}
        >
          <span className="material-symbols-outlined">send</span>
        </Button>
      </div>
    </div>
  );
}
