"use client";

import "../types";
// import { Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
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

export default function Home() {
  const [bgInfo, setBgInfo] = useState<BgInfo>();
  useEffect(() => {
    fetch("/api/GetWallpaper", { method: "GET" }).then(async (r) => {
      const respJson = (await r.json()) as BgInfo;
      setBgInfo(respJson);
    });
  }, []);

  return (
    <div
      className="absolute inset-0 flex bg-cyan-800"
      style={{ backgroundImage: "url(" + bgInfo?.image + ")" }}
    >
      <div className="md:m-auto mx-5 md:w-md w-full my-auto p-4 xl:w-1/3 backdrop-blur-sm bg-white/50 rounded-2xl flex items-center xl:justify-center flex-col">
        <div className="text-3xl font-bold text-black">Budget Buddy</div>
        <div className="xl:flex-col md:m-2/10 w-full flex-row space-x-3 space-y-4 p-4">
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
        </div>
        {/* {props.isPinging ? (
          <div style={{ textAlign: "center", fontSize: "1.2em" }}>
            Starting up the web API service...
            <span className="Loading material-symbols-outlined">sync</span>
          </div>
        ) : isLoggingIn ? (
          <div style={{ textAlign: "center", fontSize: "1.2em" }}>
            Processing to log in, please wait...
            <span className="Loading material-symbols-outlined">sync</span>
          </div>
        ) : (
          <div className={styles.InputBox}>
            <TextField
              label="Email Address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <TextField
              label="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
            />
            <FormControlLabel
              control={
                <Switch onClick={() => setIsRememberMe(!isRememberMe)} />
              }
              label="Remember me for 2 weeks"
              checked={isRememberMe}
            />
            <Button
              variant="contained"
              onClick={() => submitLogin(email, password)}
            >
              Login
            </Button>
            <div className={styles.DivisionLine}>
              <div />
              <div>OR</div>
              <div />
            </div>
            <Button
              variant="contained"
              onClick={() => {
                setTimeout(() =>
                  submitLogin("testuser@corvin.com", "7uzld7itropi1wew0ePr*")
                );
              }}
            >
              Login with test account
            </Button>
          </div>
        )} */}
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
