"use client";

import { Button } from "@mui/material";
import moment from "moment";
import { useEffect, useState } from "react";

const STATUS_TEXT = [
  "Ready",
  "Uploading Receipt",
  "Saving Transaction As Draft",
  "AI Processing",
  "Saving Transaction with the Receipt Data",
  "Done",
];
const STATUS_ERROR_TEXT = [
  "",
  "Failed to Upload!",
  "Unable to save the draft transaction!",
  "Error when analyzing with AI!",
  "Unable to save the transaction!",
  "",
];

const UploadingFile = ({
  file,
  started,
  onDelete,
}: {
  file: File;
  started: boolean;
  onDelete: () => void;
}) => {
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

      const receiptData: Receipt = await uploadResult.json();

      let newTrans: Transaction = {
        transdate: new Date(),
        store: "<Draft>",
        location: "<Draft>",
        sale_tax: 0,
        items: [],
        isdraft: true,
        receipt: receiptData,
      };

      setStatus(2);
      const saveResultDraft = await fetch("/api/Transaction", {
        method: "PUT",
        body: JSON.stringify(newTrans),
      });

      if (saveResultDraft.status !== 200) {
        setStatus(-2);
        return;
      }

      const transId = (await saveResultDraft.json()).transId;

      setStatus(3);
      const readReceiptResult = await fetch("/api/AI/ReadReceipt", {
        method: "POST",
        body: JSON.stringify(receiptData),
      });
      if (readReceiptResult.status !== 200) {
        setStatus(-3);
        return;
      }

      const receiptList: ReceiptContent = await readReceiptResult.json();
      let dateTime = moment(receiptList.date_time);
      if (!dateTime.isValid()) dateTime = moment();

      newTrans = {
        trans_id: transId,
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

      setStatus(4);

      const saveResult = await fetch("/api/Transaction", {
        method: "POST",
        body: JSON.stringify(newTrans),
      });

      if (saveResult.status !== 200) {
        setStatus(-4);
        return;
      }

      setStatus(5);
    });
  }, [started]);

  return (
    <div className="border-2 p-2 flex flex-row items-center">
      <span className="cursor-pointer mr-2" onClick={onDelete}>
        ❌
      </span>
      {file.name} - {(file.size / 1024).toFixed(0)}KB -{" "}
      {status >= 0 ? STATUS_TEXT[status] : STATUS_ERROR_TEXT[-status]}
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
        <UploadingFile
          key={j}
          file={i}
          started={started}
          onDelete={() => {
            const newFiles = files.filter((_, index) => index !== j);
            setFiles(newFiles);
          }}
        />
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
