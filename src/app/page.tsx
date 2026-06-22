"use client";

import styles from "./homepage.module.css";
import "../types";
// import { Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import Link from "next/link";

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
      className="absolute inset-0 flex"
      style={{ backgroundImage: "url(" + bgInfo?.image + ")" }}
    >
      <div className="xl:m-auto mx-5 w-full my-auto p-4 xl:w-1/3  bg-white/50 rounded-2xl flex items-center xl:justify-center flex-col">
        <div className="text-3xl text-gray-600">Budget Buddy</div>
        <div className="xl:flex-col xl:w-full flex-row space-x-3 space-y-4 p-4">
          <div className="w-full p-4 rounded-2xl text-xl border border-gray-600 text-gray-600">
            <Link href="/viewtrans">
              <span className="material-symbols-outlined align-middle">
                data_table
              </span>
              Dashboard
            </Link>
          </div>
          <div className="w-full p-4 rounded-2xl text-xl border border-gray-600 text-gray-600">
            <Link href="/addtrans">
              <span className="material-symbols-outlined align-middle">
                playlist_add
              </span>
              New Transaction
            </Link>
          </div>
          <div className="w-full p-4 rounded-2xl text-xl border border-gray-600 text-gray-600">
            <Link href="/shoppinglist">
              <span className="material-symbols-outlined align-middle">
                playlist_add
              </span>
              Shopping List
            </Link>
          </div>
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

      <div className={styles.BgInfo}>
        <div className={styles.Title}>&quot;{bgInfo?.title}&quot;</div>
        <a href={bgInfo?.cpUrl} target="_blank">
          {bgInfo?.copyright}
        </a>
        <br />
      </div>
    </div>
  );
}
