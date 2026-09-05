"use client";

import moment from "moment";
import { TextField, Button, Switch, FormControlLabel } from "@mui/material";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import TransactionInput from "./TransactionInput";

import { useRouter } from "next/navigation";

import AlertDialog from "@/components/AlertDialog";

type EditTransProps = {
  trans?: Transaction;
};

async function extractReceiptContent(
  setDialogParams: Dispatch<SetStateAction<AlertDialogParams>>,
  receipt?: Receipt
) {
  setDialogParams({
    open: true,
    title: "Analyzing Receipt Content",
    jsx: (
      <div>
        <span className="Loading material-symbols-outlined">sync</span>
        Analyzing the receipt with AI...
      </div>
    ),
    noOkButton: true,
  });

  const readReceiptResult = await await fetch("/api/AI/ReadReceipt", {
    method: "POST",
    body: JSON.stringify(receipt),
  });
  if (readReceiptResult.status !== 200) {
    setDialogParams({
      open: true,
      title: "Analyzing Receipt Content",
      jsx: <div>The uploaded image is not a receipt!</div>,
    });
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
    receipt: receiptList.receipt,
  };
  setDialogParams({
    open: false,
  });
  return newTrans;
}

function UploadReceiptDialog({
  OnDialogClosed,
  cancel,
}: {
  OnDialogClosed: (file: File | undefined, useAI: boolean) => void;
  cancel?: boolean;
}) {
  const [isUseAi, setIsUseAi] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<File>();

  const latestStateRef = useRef({ selectedFile, isUseAi });

  useEffect(() => {
    latestStateRef.current = { selectedFile, isUseAi };
  }, [selectedFile, isUseAi]);

  useEffect(() => {
    return () => {
      console.debug("On destroy");
      console.debug(cancel);
      if (cancel) return;
      const { selectedFile, isUseAi } = latestStateRef.current;
      if (selectedFile !== undefined) OnDialogClosed(selectedFile, isUseAi);
    };
  }, [cancel]);

  return (
    <div>
      <input
        type="file"
        onChange={async (evt) => {
          if (evt.target.files?.length) {
            const file = evt.target.files?.[0];
            if (file !== undefined) setSelectedFile(file);
          }
        }}
      />
      <FormControlLabel
        control={<Switch onClick={() => setIsUseAi(!isUseAi)} />}
        label="Analyze the receipt content with AI"
        checked={isUseAi}
      />
    </div>
  );
}

export default function EditTransPage(props: EditTransProps) {
  const router = useRouter();
  const [curTrans, setCurTrans] = useState<Transaction>(
    props.trans === undefined
      ? ({
          transdate: new Date(),
          store: "",
          location: "",
          items: [],
          receipt: {} as Receipt,
          sale_tax: 0,
        } as Transaction)
      : (props.trans as Transaction)
  );
  const [dateUpdateKey, setDateUpdateKey] = useState<number>(Date.now());
  const [dialogParams, setDialogParams] = useState<AlertDialogParams>(
    {} as AlertDialogParams
  );

  function uploadReceiptDialog(
    onReceiptSelected: (file: File | undefined, useAI: boolean) => void,
    cancel?: boolean
  ) {
    setDialogParams({
      open: true,
      title: "Upload Receipt",
      jsx: (
        <UploadReceiptDialog
          OnDialogClosed={onReceiptSelected}
          cancel={cancel}
        />
      ),
    });
  }

  const openUploadDialog = () =>
    uploadReceiptDialog(async (file, useAI) => {
      let fileResult: Receipt | undefined = undefined;

      if (file !== undefined) {
        setDialogParams({
          open: true,
          title: "Uploading Receipt",
          jsx: (
            <div>
              <span className="Loading material-symbols-outlined">sync</span>
              Uploading Receipt to the server...
            </div>
          ),
          noOkButton: true,
        });
        const formData = new FormData();
        formData.append("file", file);
        const uploadResult = await fetch("/api/UploadReceipt", {
          method: "PUT",
          body: formData,
        });
        fileResult = await uploadResult.json();
        const newTrans = { ...curTrans, receipt: fileResult };
        setCurTrans(newTrans);
      }
      if (useAI && !!fileResult) {
        const newTrans = await extractReceiptContent(
          setDialogParams,
          fileResult
        );
        if (newTrans !== undefined) {
          newTrans.trans_id = curTrans.trans_id;
          setCurTrans(newTrans);
          setDateUpdateKey(Date.now());
        }
      } else {
        setDialogParams({
          open: false,
        });
      }
    });

  const [markAsFinal, setMarkAsFinal] = useState(false);

  return (
    <div className="flex flex-col p-4 size-full gap-2">
      <AlertDialog params={dialogParams} />
      <div className="grow-0 md:text-left text-center text-2xl font-bold">
        Add/Edit Transaction
      </div>
      <div className="h-full flex gap-4 flex-col md:flex-row flex-1 min-h-0">
        <div className="gap-4 md:w-4/12 w-full md:h-full flex md:flex-col flex-row h-2/12">
          <div className="md:w-full w-1/3 flex min-h-0 md:h-4/6 md:flex-1 bg-slate-200/60 border-2 border-slate-300 rounded-xl md:p-4 p-2 flex-col relative overflow-hidden">
            <div className="text-lg grow-0 ">Receipt</div>
            <div className="group flex flex-1 min-h-0">
              <div className="flex-1 object-contain h-full md:flex items-center justify-center">
                {!curTrans.receipt?.filename ? (
                  <div onClick={() => openUploadDialog()}>
                    <span className="material-symbols-outlined align-middle">
                      Upload
                    </span>{" "}
                    Upload
                  </div>
                ) : (
                  <>
                    <img
                      src={"/receipts/" + curTrans.receipt.filename}
                      alt="Receipt Preview"
                      className="h-full object-contain md:block hidden"
                    />
                    <a
                      href={"/receipts/" + curTrans.receipt.filename}
                      target="_blank"
                      className="md:hidden"
                    >
                      <span className="material-symbols-outlined align-middle">
                        open_in_new
                      </span>{" "}
                      View
                    </a>
                    <br />
                    <a
                      href="#"
                      className="md:hidden"
                      onClick={() => (openUploadDialog(), false)}
                    >
                      <span className="material-symbols-outlined align-middle">
                        Upload
                      </span>{" "}
                      Upload
                    </a>
                  </>
                )}
              </div>
              <div className="gap-4 group-hover:flex flex-col justify-center items-center hidden absolute size-full bg-blue-300/50 top-0 left-0 rounded-xl">
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => openUploadDialog()}
                >
                  Upload New Receipt
                </Button>
                {curTrans?.receipt?.filename && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      window.open("/receipts/" + curTrans?.receipt?.filename);
                    }}
                  >
                    View Full Size
                  </Button>
                )}
                {curTrans?.receipt?.filename && (
                  <Button
                    size="small"
                    variant="contained"
                    color="secondary"
                    onClick={async () => {
                      const newTrans = await extractReceiptContent(
                        setDialogParams,
                        curTrans.receipt
                      );
                      if (newTrans !== undefined) {
                        newTrans.trans_id = curTrans.trans_id;
                        setCurTrans(newTrans);
                        setDateUpdateKey(Date.now());
                      }
                    }}
                  >
                    Re-analyze with AI
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="md:w-full w-2/3 md:h-2/6 md:flex-1 bg-slate-200/60 border-2 border-slate-300 rounded-xl md:p-4 p-2 gap-2 flex flex-col">
            <div className="text-lg md:block hidden">Transaction Summary</div>
            <div className="flex">
              <div>Store</div>
              <div className="flex-1 text-right">
                {curTrans?.store || "N/A"}
              </div>
            </div>
            <div className="flex">
              <div>Date</div>
              <div className="flex-1 text-right">
                {moment(curTrans?.transdate || new Date()).format(
                  "YYYY-MM-DD HH:mm:ss"
                )}
              </div>
            </div>
            <div className="flex">
              <div>Total</div>
              <div className="flex-1 text-right">
                $
                {curTrans.items
                  ? curTrans.items.reduce((p, c) => p + c.amount, 0)
                  : 0}
              </div>
            </div>
            {curTrans.isdraft && (
              <div className="hidden md:block border-2 border-slate-300 rounded-xl md:p-4 p-2">
                <div className="text-2xl text-center">
                  {markAsFinal
                    ? "This transaction is marked as final"
                    : "This transaction is a draft"}
                </div>
                <div className="text-center mt-2">
                  {!markAsFinal && (
                    <Button
                      variant="contained"
                      onClick={() => {
                        setMarkAsFinal(true);
                      }}
                    >
                      Mark as final
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-slate-200/60 border-2 border-slate-300 rounded-xl md:w-8/12 flex-1 min-h-0 p-4 flex flex-col gap-4 w-full">
          <div className="text-lg">Transaction Data</div>
          <div className="flex gap-4">
            <TextField
              key={dateUpdateKey}
              label="Date Time"
              defaultValue={moment(curTrans.transdate).format(
                "YYYY-MM-DD HH:mm:ss"
              )}
              onBlur={(evt) => {
                let dateCheck = moment(evt.target.value);
                if (!dateCheck.isValid()) dateCheck = moment();
                const newTrans = { ...curTrans };
                newTrans.transdate = dateCheck.toDate();
                setCurTrans(newTrans);
                setDateUpdateKey(Date.now());
              }}
            />
            <TextField
              label="Store"
              value={curTrans.store}
              onChange={(evt) => {
                const newTrans = { ...curTrans };
                newTrans.store = evt.target.value;
                setCurTrans(newTrans);
              }}
            />
            <TextField
              label="Store Address"
              value={curTrans.location}
              onChange={(evt) => {
                const newTrans = { ...curTrans };
                newTrans.location = evt.target.value;
                setCurTrans(newTrans);
              }}
            />
          </div>
          <div className="flex ">
            <div className="text-lg flex-1">Items</div>
            <div className="flex-1 text-right ">
              <Button
                variant="contained"
                onClick={() => {
                  const items = curTrans.items.concat([]);
                  items.push({
                    amount: 0,
                    item: "",
                    category: "",
                    remark: "",
                  });
                  setCurTrans({
                    ...curTrans,
                    items,
                  });
                }}
              >
                <span className="material-symbols-outlined ActionBtn">add</span>
              </Button>
            </div>
          </div>
          <div className="flex-1 flex flex-col overflow-auto gap-4 py-2">
            {curTrans.items?.map((i, j) => (
              <TransactionInput
                key={j}
                item={i}
                onChange={(newV) => {
                  const items = curTrans.items.concat([]);
                  items.splice(j, 1, newV);
                  setCurTrans({
                    ...curTrans,
                    items,
                  });
                }}
                onDelete={() => {
                  const items = curTrans.items.concat([]);
                  items.splice(j, 1);
                  setCurTrans({
                    ...curTrans,
                    items,
                  });
                }}
              />
            ))}
          </div>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            onClick={async () => {
              setDialogParams({
                open: true,
                title: "Confirm to Save the Transaction",
                jsx: (
                  <div>
                    <p>
                      Are you sure to save this transaction? Please make sure
                      the information is correct, especially if it is the result
                      of AI analysis.
                    </p>
                    <br />
                    <p>
                      Date of transaction:{" "}
                      <b>
                        {moment(curTrans.transdate).format(
                          "YYYY-MM-DD HH:mm:ss"
                        )}
                      </b>
                    </p>
                  </div>
                ),
                async OnDialogOk() {
                  if (curTrans.isdraft && markAsFinal)
                    curTrans.isdraft = undefined;
                  setDialogParams({
                    open: true,
                    title: "Saving the Transaction Record",
                    jsx: (
                      <div>
                        <span className="Loading material-symbols-outlined">
                          sync
                        </span>
                        Saving the transaction record to the database...
                      </div>
                    ),
                    noOkButton: true,
                  });
                  const result = await fetch("/api/Transaction", {
                    method: curTrans.trans_id ? "POST" : "PUT",
                    body: JSON.stringify(curTrans),
                  });
                  if (result.status === 200) router.push("/viewtrans");
                  else {
                    setDialogParams({
                      open: true,
                      title: "Unable to save this transaction",
                      jsx: (
                        <div>
                          Please check the input and try again!
                          <br />
                          <div>{JSON.stringify(await result.json())}</div>
                        </div>
                      ),
                    });
                  }
                },
                OnDialogCancel() {},
              });
            }}
          >
            <span className="material-symbols-outlined">send</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
