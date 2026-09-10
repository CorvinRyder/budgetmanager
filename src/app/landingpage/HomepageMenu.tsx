"use client";

import Link from "next/link";

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

export default function HomepageMenu() {
  return (
    <div className="xl:flex-col md:m-2/10 w-full flex-row space-x-3 space-y-4 p-4">
      <LinkBlock link="/viewtrans" text="Dashboard" icon="data_table" />
      <LinkBlock link="/addtrans" text="New Transaction" icon="playlist_add" />
      <LinkBlock link="/batchupload" text="Batch Upload" icon="stack" />
      <LinkBlock
        link="/shoppinglist"
        text="Shopping List"
        icon="playlist_add"
      />
    </div>
  );
}
