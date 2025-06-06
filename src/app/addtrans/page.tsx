"use client";

import moment from "moment";
import { TextField, Button } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";

type ItemInputProps = {
  item: TransItem;
  onChange?: (newV: TransItem) => void;
  onDelete?: () => void;
};

let ItemInput = function (props: ItemInputProps) {
  const onChangeHandler = function (newVal: string, key: keyof TransItem) {
    let newItem = { ...props.item };
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
    props.onChange && props.onChange(newItem);
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

export default function EditTransPage(props: EditTransProps) {
  const [curTrans, setCurTrans] = useState<Transaction>(
    props.trans || {
      transdate: new Date(),
      location: "",
      items: [],
      receipt: {} as Receipt,
      sale_tax: 0,
    }
  );
  const [receiptFile, setReceiptFile] = useState<File>();
  const fileInput = useRef<HTMLInputElement>(null);
  const receiptUrl = useMemo(() => {
    if (receiptFile !== undefined && receiptFile !== null)
      return URL.createObjectURL(receiptFile);
    else if (curTrans.receipt) return "/receipts/" + curTrans.receipt.filename;
    else return "";
  }, [receiptFile]);
  const [dateUpdateKey, setDateUpdateKey] = useState<number>(Date.now());
  return (
    <div>
      <div>
        <TextField
          key={dateUpdateKey}
          placeholder="Item"
          defaultValue={moment(curTrans.transdate).format(
            "YYYY-MM-DD HH:mm:ss"
          )}
          onBlur={(evt) => {
            let dateCheck = moment(evt.target.value);
            if (!dateCheck.isValid) dateCheck = moment();
            let newTrans = { ...curTrans };
            newTrans.transdate = dateCheck.toDate();
            setCurTrans(newTrans);
          }}
        />
        {}
      </div>
      <hr />
      <div>
        <div>Upload a receipt or do it later</div>
        <input
          type="file"
          ref={fileInput}
          onChange={async (evt) => {
            if (evt.target.files?.length) {
              setReceiptFile(evt.target.files[0]);
              let formData = new FormData();
              formData.append("file", evt.target.files[0]);
              let receiptList: ReceiptContent = await (
                await fetch("/api/AI/ReadReceipt", {
                  method: "POST",
                  body: formData,
                })
              ).json();
              console.debug(receiptList);
              let newTrans: Transaction = {
                transdate: moment(receiptList.date_time).toDate(),
                location: receiptList.store_name,
                sale_tax: receiptList.sale_tax,
                items: receiptList.items.map(
                  (i) =>
                    ({
                      item: i.name,
                      amount: i.price,
                      remark: i.quantity?.toString(),
                      category: "XX",
                    } as TransItem)
                ),
              };
              setCurTrans(newTrans);
              setDateUpdateKey(Date.now());
            } else setReceiptFile(undefined);
          }}
        />
        {receiptFile && (
          <span
            className="material-symbols-outlined ActionBtn"
            onClick={() => {
              if (fileInput.current !== null) fileInput.current.value = "";
              setReceiptFile(undefined);
            }}
          >
            delete
          </span>
        )}
        <div>
          <a href={receiptUrl} target="_blank">
            Receipt File
          </a>
        </div>
      </div>
      <hr />
      <div>
        <TextField
          placeholder="Where did you buy these item?"
          value={curTrans.location}
          onChange={(evt) => {
            let newTrans = { ...curTrans };
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
          let newTrans = { ...curTrans };
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
              let items = curTrans.items.concat([]);
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
                let items = curTrans.items.concat([]);
                items.splice(j, 1, newV);
                setCurTrans({
                  ...curTrans,
                  items,
                });
              }}
              onDelete={() => {
                let items = curTrans.items.concat([]);
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
          onClick={() => {
            const formData = new FormData();
            formData.append("transdata", JSON.stringify(curTrans));
            if (receiptFile !== undefined) formData.append("file", receiptFile);
            fetch("/api/Transaction", {
              method: "PUT",
              body: formData,
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
