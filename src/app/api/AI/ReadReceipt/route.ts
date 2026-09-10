import { GoogleGenAI } from "@google/genai";

import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { connectToDatabase } from "@/db";

export async function POST(req: NextRequest) {
  const { filename, receipt_id }: Receipt = await req.json();
  const filePath = filename;

  if (filePath === null)
    return NextResponse.json(
      { message: "No image is uploaded" },
      { status: 400 }
    );

  try {
    const pool = await connectToDatabase();
    const sqlReq = pool.request();

    const dbResult = await sqlReq.query(
      `select cat_code, ai_desc from bm_categories`
    );
    const resultCasted: Array<{ cat_code: string; ai_desc: string }> =
      dbResult.recordset;
    const catStr: string[] = resultCasted.map(
      (i) => `- ${i.ai_desc} belongs to ${i.cat_code}`
    );

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_KEY,
    });

    let arrayBuff = undefined;
    if (filePath !== null) {
      arrayBuff = (
        await fs.readFile(process.cwd() + "/receipts/" + filePath, {
          flag: "r",
        })
      ).buffer;
    }

    if (arrayBuff === undefined)
      return NextResponse.json(
        {
          store_name: "No image is uploaded",
        },
        { status: 400 }
      );

    const base64ImageData = Buffer.from(arrayBuff).toString("base64");

    let mimeType = "";
    if (filePath) {
      mimeType = filePath.substring(filePath.lastIndexOf(".") + 1);
      console.debug(mimeType);
      if (mimeType === "pdf") mimeType = "application/pdf";
      else {
        if (mimeType === "jpg") mimeType = "jpeg";
        mimeType = "image/" + mimeType;
      }
    }

    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64ImageData,
          },
        },
        {
          text: `Please extract the store name (store_name), store address (store_addr), 
					date time (date_time) and the list of item (items) (name, price)
					from this receipt in JSON format.
          If the transaction includes tips and / or sale tax, please add them as items in the item list.
          Please try to calculate the % of the tip and put it in the remark of "tip" item
            When parsing the date of the recipt, please try to get the most recent date base on the components of the date
					Please use ISO format for the date time.
          Can you try to guess what the items actually are, and put your guess to a key called "remark" of each item?
          Please categorize the item, and put it in the "category" field of each item:
          ${catStr.join("\r\n")}
          For address, please try to split the address parts with comma.
					If the image is not a receipt, please stop analyzing the item immediately and return the string "NOT_A_RECEIPT"`,
        },
      ],
    });
    let resultText = result.text;
    console.debug(resultText);
    if (resultText === "NOT_A_RECEIPT")
      return NextResponse.json(
        {
          store_name: "NOT_A_RECEIPT",
        },
        { status: 400 }
      );
    resultText = resultText?.substring(7, resultText.length - 3);
    const receiptList: ReceiptContent = JSON.parse(resultText || "");
    receiptList.receipt = { filename, receipt_id };
    return NextResponse.json(receiptList, { status: 200 });
  } catch (err) {
    throw err;
    return NextResponse.json({ message: err }, { status: 500 });
  }
}
