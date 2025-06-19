import { GoogleGenAI } from "@google/genai";

import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const filePath = formData.get("filepath") as string;

  if (file === null && filePath === null)
    return NextResponse.json(
      { message: "No image is uploaded" },
      { status: 400 }
    );

  try {
    const ai = new GoogleGenAI({
      apiKey: "AIzaSyC2PQxaJhJ8a0UsT6ImS5RUV9eYtv4l4Bg",
    });

    let arrayBuff = undefined;
    if (file !== null) arrayBuff = await file.arrayBuffer();
    else if (filePath !== null) {
      arrayBuff = (
        await fs.readFile(process.cwd() + "/" + filePath, {
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
    if (file !== null) mimeType = file.type;
    else {
      mimeType = filePath.substring(filePath.lastIndexOf(".") + 1);
      console.debug(mimeType);
      if (mimeType === "pdf") mimeType = "application/pdf";
      else {
        if (mimeType === "jpg") mimeType = "jpeg";
        mimeType = "image/" + mimeType;
      }
    }

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
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
          If the year part has only 2 digits, please try to extract the date as YY-MM-DD.
					Please use ISO format for the date time.
          Can you try to guess what the items actually are, and put your guess to a key called "remark" of each item?
          Please categorize the item, and put it in the "category" field of each item:
           - Groceries for the main meals (breakfast, lunch and dinner) belong to "Grocery"
           - Meal that was had or bought from any restaurant belongs to "Eat Out"
           - Items that were bought from the online stores belong to "Online Shopping"
           - Snacks and food that doesn't belong to the main meals belong to "Snacks"
           - Items that is for entertainment, like admission fee or toys, belong to "Entertainment"
           - Tips and Tax belong to "Tip and Tax"
           - For anything that can't fit in any of the categories mentioned about, put them under "Misc."
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
    return NextResponse.json(receiptList, { status: 200 });
  } catch (err) {
    throw err;
    return NextResponse.json({ message: err }, { status: 500 });
  }
}
