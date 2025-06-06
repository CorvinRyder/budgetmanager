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
          text: `Please extract the store name, store address, 
					date time, sale tax and the list of item (name, price, and quantity if available)
					from this receipt in JSON format.
					Please use ISO format for the date time.
					If the image is not a receipt, please return "NOT_A_RECEIPT".`,
        },
      ],
    });
    let resultText = result.text;
    console.debug(resultText);
    if (resultText === "NOT_A_RECEIPT")
      return NextResponse.json(
        {
          message: "NOT_A_RECEIPT",
        },
        { status: 500 }
      );
    resultText = resultText?.substring(7, resultText.length - 3);
    let receiptList: ReceiptContent = JSON.parse(resultText || "");
    return NextResponse.json(receiptList, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 500 });
  }
}
