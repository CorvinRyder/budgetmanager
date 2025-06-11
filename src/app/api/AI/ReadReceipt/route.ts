import { GoogleGenAI } from "@google/genai";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (file === undefined || file === null)
    return NextResponse.json(
      { message: "No image is uploaded" },
      { status: 500 }
    );

  try {
    const ai = new GoogleGenAI({
      apiKey: "AIzaSyC2PQxaJhJ8a0UsT6ImS5RUV9eYtv4l4Bg",
    });

    const base64ImageData = Buffer.from(await file.arrayBuffer()).toString(
      "base64"
    );

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          inlineData: {
            mimeType: file.type,
            data: base64ImageData,
          },
        },
        {
          text: `Please extract the store name (store_name), store address (store_addr), 
					date time (date_time), sale tax (sale_tax) and the list of item (items) (name, price, and quantity if available)
					from this receipt in JSON format.
          If the year part has only 2 digits, please try to extract the date as YY-MM-DD.
					Please use ISO format for the date time.
          Can you try to guess what the items actually are, and put your guess to a key called "remark" of each item?
          Try to categorize the item, like Grocery, Snack and some other category you think the item would fit, and put it in the category key.
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
    return NextResponse.json({ message: err }, { status: 500 });
  }
}
