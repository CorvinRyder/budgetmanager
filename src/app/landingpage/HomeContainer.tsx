import "@/types";
import { cookies } from "next/headers";
import { ReactNode } from "react";

type BgInfo = {
  image: string;
  title: string;
  copyright: string;
  cpUrl: string;
};

export default async function HomeContainer({
  children,
}: {
  children: ReactNode;
}) {
  const resp = await fetch(
    "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US&rnd=" +
      Date.now(),
    {
      method: "GET",
    }
  );

  const respJson = await resp.json();

  const bgInfo: BgInfo = {
    image: "https://www.bing.com" + respJson.images[0].url,
    title: respJson.images[0].title,
    copyright: respJson.images[0].copyright,
    cpUrl: respJson.images[0].copyrightlink,
  };

  return (
    <div
      className="absolute inset-0 flex bg-cyan-800 flex-col"
      style={{ backgroundImage: "url(" + bgInfo?.image + ")" }}
    >
      <div className="md:m-auto mx-5 md:w-md my-5 h-auto md:my-auto p-4 xl:w-1/3 backdrop-blur-sm bg-white/50 rounded-2xl flex items-center xl:justify-center flex-col">
        <div className="text-3xl font-bold text-black">Budget Buddy</div>
        {children}
      </div>

      <div className="hidden md:block md:absolute mx-5 my-5 bottom-5 left-5 w-64 p-5 backdrop-blur-sm bg-white/50">
        <div className="text-lg font-bold">&quot;{bgInfo?.title}&quot;</div>
        <a href={bgInfo?.cpUrl} target="_blank">
          {bgInfo?.copyright}
        </a>
        <br />
      </div>
    </div>
  );
}
