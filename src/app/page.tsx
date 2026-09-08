import "../types";
import Link from "next/link";
import LoginForm from "./login/LoginForm";
import { cookies } from "next/headers";

type BgInfo = {
  image: string;
  title: string;
  copyright: string;
  cpUrl: string;
};

const LinkBlock = ({
  icon,
  text,
  link,
}: {
  icon: string;
  text: string;
  link: string;
}) => {
  return (
    <Link
      href={link}
      className="gap-3 items-center justify-center flex w-full p-4 rounded-2xl text-xl border border-gray-600 text-black text-center"
    >
      <span className="material-symbols-outlined mr-2">{icon}</span>
      {text}
    </Link>
  );
};

export default async function Home() {
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

  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get("session-token") !== undefined;

  return (
    <div
      className="absolute inset-0 flex bg-cyan-800"
      style={{ backgroundImage: "url(" + bgInfo?.image + ")" }}
    >
      <div className="md:m-auto mx-5 md:w-md w-full my-auto p-4 xl:w-1/3 backdrop-blur-sm bg-white/50 rounded-2xl flex items-center xl:justify-center flex-col">
        <div className="text-3xl font-bold text-black">Budget Buddy</div>
        <div className="xl:flex-col md:m-2/10 w-full flex-row space-x-3 space-y-4 p-4">
          {isLoggedIn ? (
            <>
              <LinkBlock link="/viewtrans" text="Dashboard" icon="data_table" />
              <LinkBlock
                link="/addtrans"
                text="New Transaction"
                icon="playlist_add"
              />
              <LinkBlock link="/batchupload" text="Batch Upload" icon="stack" />
              <LinkBlock
                link="/shoppinglist"
                text="Shopping List"
                icon="playlist_add"
              />
            </>
          ) : (
            <LoginForm />
          )}
        </div>
      </div>

      <div className="absolute bottom-5 left-5 w-64 p-5 backdrop-blur-sm bg-white/50">
        <div className="text-lg font-bold">&quot;{bgInfo?.title}&quot;</div>
        <a href={bgInfo?.cpUrl} target="_blank">
          {bgInfo?.copyright}
        </a>
        <br />
      </div>
    </div>
  );
}
