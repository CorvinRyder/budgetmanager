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
      className={styles.LoginScreenContainer}
      style={{ backgroundImage: "url(" + bgInfo?.image + ")" }}
    >
      <div className={styles.LoginBox}>
        <div className={styles.AppTitle}>Budget Buddy</div>
        <div className={styles.TitleButtons}>
          <div>
            <Link href="/viewtrans">
              <span className="material-symbols-outlined">data_table</span>
              Dashboard
            </Link>
          </div>
          <div>
            <Link href="/addtrans">
              <span className="material-symbols-outlined">playlist_add</span>
              New Transaction
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
