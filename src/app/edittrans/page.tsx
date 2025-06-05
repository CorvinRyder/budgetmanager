"use client";

import moment from "moment";
import { TextField, Select, MenuItem, Button } from "@mui/material";
import { useRef, useState } from "react";

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
      />{" "}
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

export default function NewInput() {
  const [curTrans, setCurTrans] = useState<Transaction>({
    transdate: new Date(),
    location: "",
    items: [],
    receipt: {} as Receipt,
  });
  const [receiptFile, setReceiptFile] = useState<File>();
  const fileInput = useRef<HTMLInputElement>(null);
  return (
    <div>
      <div>
        <span
          className="material-symbols-outlined ActionBtn"
          onClick={() => {
            // storageDateMoment.subtract(1, "day");
            // row.storageDate = storageDateMoment.toDate();
            // editDialog(row, showDialog, setLastRefresh);
          }}
        >
          remove
        </span>
        {moment(curTrans.transdate).format("YYYY-MM-DD")}
        <span
          className="material-symbols-outlined ActionBtn"
          onClick={() => {
            // storageDateMoment.add(1, "day");
            // row.storageDate = storageDateMoment.toDate();
            // editDialog(row, showDialog, setLastRefresh);
          }}
        >
          add
        </span>
      </div>
      <hr />
      <div>
        <div>Upload a receipt or do it later</div>
        <input
          type="file"
          ref={fileInput}
          onChange={(evt) => {
            if (evt.target.files?.length) {
              setReceiptFile(evt.target.files[0]);
            }
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
      <div>
        <div>
          Items in this transaction{" "}
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
          {curTrans.items.map((i, j) => (
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
        <hr />
        <Button
          variant="contained"
          onClick={() => {
            fetch("/api/GetTrans", {
              method: "GET",
            });
          }}
        >
          Check DB
        </Button>
      </div>
    </div>
  );
}
