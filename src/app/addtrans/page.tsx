"use client";

import moment from "moment";
import { TextField, Button, Switch, FormControlLabel } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import Classes from "./pages.module.css";
import AlertDialog from "@/components/AlertDialog";

type ItemInputProps = {
  item: TransItem;
  onChange?: (newV: TransItem) => void;
  onDelete?: () => void;
};

const ItemInput = function (props: ItemInputProps) {
  const onChangeHandler = function (newVal: string, key: keyof TransItem) {
    const newItem = { ...props.item };
    switch (key) {
      case "amount":
        newItem.amount = parseFloat(newVal);
        break;
      case "cashflow_id":
      case "trans_id":
        return;
      default:
        newItem[key] = newVal;
    }
    if (props.onChange !== undefined) props.onChange(newItem);
  };
  return (
    <div>
      <TextField
        placeholder="Item"
        value={props.item.item}
        onChange={(evt) => {
          onChangeHandler(evt.target.value, "item");
        }}
      />
      <TextField
        placeholder="Amount"
        value={props.item.amount}
        onChange={(evt) => {
          onChangeHandler(evt.target.value, "amount");
        }}
      />
      <TextField
        placeholder="Category"
        value={props.item.category}
        onChange={(evt) => {
          onChangeHandler(evt.target.value, "category");
        }}
      />
      <TextField
        placeholder="Remark"
        value={props.item.remark}
        onChange={(evt) => {
          onChangeHandler(evt.target.value, "remark");
        }}
      />
      <Button variant="outlined">
        <span
          className="material-symbols-outlined ActionBtn"
          style={{ flex: 0.1, textAlign: "right" }}
          onClick={() => props.onDelete && props.onDelete()}
        >
          delete
        </span>
      </Button>
    </div>
  );
};

type EditTransProps = {
  trans?: Transaction;
};

async function extractReceiptContent(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const readReceiptResult = await await fetch("/api/AI/ReadReceipt", {
    method: "POST",
    body: formData,
  });
  if (readReceiptResult.status === 400) {
    return;
  }
  const receiptList: ReceiptContent = await readReceiptResult.json();
  console.debug(receiptList);

  const newTrans: Transaction = {
    transdate: moment(receiptList.date_time).toDate(),
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

function UploadReceiptDialog(props: {
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
      console.debug(props.cancel);
      if (props.cancel) return;
      const { selectedFile, isUseAi } = latestStateRef.current;
      if (selectedFile !== undefined)
        props.OnDialogClosed(selectedFile, isUseAi);
    };
  }, [props.cancel]);

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
  const [curTrans, setCurTrans] = useState<Transaction>(
    props.trans || {
      transdate: new Date(),
      store: "",
      location: "",
      items: [],
      receipt: {} as Receipt,
      sale_tax: 0,
    }
  );
  const [receiptFile, setReceiptFile] = useState<File>();
  const receiptUrl = useMemo(() => {
    if (receiptFile !== undefined && receiptFile !== null)
      return URL.createObjectURL(receiptFile);
    else if (curTrans.receipt?.filename)
      return "/receipts/" + curTrans.receipt.filename;
    else return "";
  }, [receiptFile]);
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
      // OnDialogCancel() {
      //   uploadReceiptDialog(onReceiptSelected, true);
      // },
    });
  }

  return (
    <div>
      <AlertDialog params={dialogParams} />
      <div>
        <div className={Classes.ReceiptUploadBox}>
          <div
            className={Classes.imgblock}
            onClick={() =>
              uploadReceiptDialog(async (file, useAI) => {
                if (file !== undefined && useAI) {
                  setDialogParams({
                    open: true,
                    title: "Analyzing Receipt Content",
                    jsx: (
                      <div>
                        <span className="Loading material-symbols-outlined">
                          sync
                        </span>
                        Analyzing the receipt with AI...
                      </div>
                    ),
                    noOkButton: true,
                  });
                  const newTrans = await extractReceiptContent(file);
                  if (newTrans !== undefined) {
                    setCurTrans(newTrans);
                    setDateUpdateKey(Date.now());
                    setDialogParams({
                      open: false,
                    });
                    setReceiptFile(file);
                  } else {
                    setDialogParams({
                      open: true,
                      title: "Analyzing Receipt Content",
                      jsx: <div>The uploaded image is not a receipt!</div>,
                    });
                  }
                } else setReceiptFile(file);
              })
            }
          >
            {!receiptUrl ? (
              <div>No receipt uploaded or selected</div>
            ) : (
              <img src={receiptUrl} />
            )}
          </div>
        </div>
        {/* {receiptFile && (
          <span
            className="material-symbols-outlined ActionBtn"
            onClick={() => {
              if (fileInput.current !== null) fileInput.current.value = "";
              setReceiptFile(undefined);
            }}
          >
            delete
          </span>
        )} */}
      </div>
      <hr />
      <div>
        <TextField
          key={dateUpdateKey}
          placeholder="Date Time"
          defaultValue={moment(curTrans.transdate).format(
            "YYYY-MM-DD HH:mm:ss"
          )}
          onBlur={(evt) => {
            let dateCheck = moment(evt.target.value);
            if (!dateCheck.isValid) dateCheck = moment();
            const newTrans = { ...curTrans };
            newTrans.transdate = dateCheck.toDate();
            setCurTrans(newTrans);
          }}
        />
      </div>
      <hr />
      <div>
        <TextField
          placeholder="Store"
          value={curTrans.store}
          onChange={(evt) => {
            const newTrans = { ...curTrans };
            newTrans.store = evt.target.value;
            setCurTrans(newTrans);
          }}
        />
        <br />
        <TextField
          placeholder="Store Address"
          value={curTrans.location}
          onChange={(evt) => {
            const newTrans = { ...curTrans };
            newTrans.location = evt.target.value;
            setCurTrans(newTrans);
          }}
        />
      </div>
      <hr />
      <TextField
        placeholder="Sale tax"
        value={curTrans.sale_tax}
        onChange={(evt) => {
          const newTrans = { ...curTrans };
          newTrans.sale_tax = parseInt(evt.target.value);
          setCurTrans(newTrans);
        }}
      />
      <hr />
      <div>
        <div>
          Items in this transaction
          <span
            className="material-symbols-outlined ActionBtn"
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
            add
          </span>
        </div>
        <div>
          {curTrans.items?.map((i, j) => (
            <ItemInput
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
        <hr />
        <Button
          variant="contained"
          onClick={async () => {
            const formData = new FormData();
            formData.append("transdata", JSON.stringify(curTrans));
            if (receiptFile !== undefined) formData.append("file", receiptFile);
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
            await fetch("/api/Transaction", {
              method: "PUT",
              body: formData,
            });
            setDialogParams({
              open: false,
            });
          }}
        >
          Submit
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            if (props.trans !== undefined) {
              const formData = new FormData();
              formData.append("transdata", JSON.stringify(curTrans));
              if (receiptFile !== undefined)
                formData.append("file", receiptFile);
              fetch("/api/Transaction", {
                method: "POST",
                body: formData,
              });
            }
          }}
        >
          Update
        </Button>
      </div>
    </div>
  );
}
