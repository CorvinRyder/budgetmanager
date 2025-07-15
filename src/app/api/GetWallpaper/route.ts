import { NextResponse } from "next/server";

declare global {
  type BgInfo = {
    image: string;
    title: string;
    copyright: string;
    cpUrl: string;
  };
}

export async function GET() {
  const resp = await fetch(
    "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US&rnd=" +
      Date.now(),
    {
      method: "GET",
    }
  );
  const respJson = await resp.json();
  return NextResponse.json(
    {
      image: "https://www.bing.com" + respJson.images[0].url,
      title: respJson.images[0].title,
      copyright: respJson.images[0].copyright,
      cpUrl: respJson.images[0].copyrightlink,
    } as BgInfo,
    { status: 200 }
  );
}
