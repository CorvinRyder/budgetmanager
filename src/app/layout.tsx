"use client";
import { CustomFetch } from "@/utils/CustomFetch";
import "./globals.css";
import Link from "next/link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Display:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </head>
      <body>
        <CustomFetch />
        <div className="size-full flex overflow-hidden md:flex-row flex-col">
          <div className="w-full flex md:w-30 bg-blue-950 flex-row md:flex-col">
            <div className="py-3 flex items-center justify-center space-x-3 ml-3 md:ml-0">
              <span className="material-symbols-outlined text-cyan-400 xl-icon">
                currency_exchange
              </span>
            </div>
            <div className="text-cyan-400 space-x-4 md:space-x-0 md:space-y-2 flex md:flex-col items-center justify-end w-full md:items-start md:p-5 mx-5 md:mx-0 gap-2">
              <div className="hover:bg-sky-700 hover:text-sky-200 text-xl rounded-lg cursor-pointer md:w-full">
                <Link href="/viewtrans" className="flex flex-col items-center">
                  <span
                    className="material-symbols-outlined align-middle lg-icon"
                    // style="font-size: calc(var(--spacing) * 8)"
                  >
                    data_table
                  </span>
                  <span className="hidden md:block text-center text-base">
                    Home
                  </span>
                </Link>
              </div>
              <div className="hover:bg-sky-700 hover:text-sky-200 text-xl rounded-lg cursor-pointer md:w-full">
                <Link href="/addtrans" className="flex flex-col items-center">
                  <span className="material-symbols-outlined align-middle lg-icon">
                    playlist_add
                  </span>
                  <span className="hidden md:block text-center text-base">
                    New Transaction
                  </span>
                </Link>
              </div>
              <div className="hover:bg-sky-700 hover:text-sky-200 text-xl rounded-lg cursor-pointer md:w-full">
                <Link
                  href="/batchupload"
                  className="flex flex-col items-center"
                >
                  <span className="material-symbols-outlined align-middle lg-icon">
                    stack
                  </span>
                  <span className="hidden md:block text-center text-base">
                    Batch Upload
                  </span>
                </Link>
              </div>
              <div className="hover:bg-sky-700 hover:text-sky-200 text-xl rounded-lg cursor-pointer md:w-full">
                <Link
                  href="/taggedtrans"
                  className="flex flex-col items-center"
                >
                  <span className="material-symbols-outlined align-middle lg-icon">
                    tag
                  </span>
                  <span className="hidden md:block text-center text-base">
                    Tag Insights
                  </span>
                </Link>
              </div>
              <div className="hover:bg-sky-700 hover:text-sky-200 text-xl rounded-lg cursor-pointer md:w-full">
                <Link
                  href="/shoppinglist"
                  className="flex flex-col items-center"
                >
                  <span className="material-symbols-outlined align-middle lg-icon">
                    shopping_bag
                  </span>
                  <span className="hidden md:block text-center text-base">
                    Shopping List
                  </span>
                </Link>
              </div>
            </div>
          </div>
          <div className="h-full w-full overflow-auto bg-slate-100">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
