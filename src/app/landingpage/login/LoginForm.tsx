"use client";

import { TextField, FormControlLabel, Switch, Button } from "@mui/material";
import HandleLogin from "./LoginAction";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(HandleLogin, {
    status: 200,
    message: "Pending",
  });

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  return (
    <div className="w-full p-4 text-black text-center">
      <form
        action={formAction}
        className="flex flex-col gap-3 items-center justify-center "
      >
        {isPending && (
          <div>
            <span className="material-symbols-outlined text-5xl! align-middle animate-spin">
              sync
            </span>{" "}
            <span className="text-2xl">Logging you in...</span>
          </div>
        )}
        {!isPending && state.status !== 200 && (
          <div className="border-2 border-red-400 rounded-2xl w-full text-red-400 text-xl py-2 px-4">
            {state.message}
          </div>
        )}

        <TextField
          name="username"
          label="Email Address"
          required
          value={userName}
          onChange={(evt) => setUserName(evt.target.value)}
        />
        <TextField
          name="password"
          label="Password"
          required
          value={password}
          onChange={(evt) => setPassword(evt.target.value)}
          type="password"
        />
        <FormControlLabel
          name="rememberMe"
          control={<Switch defaultChecked />}
          label="Remember me for 2 weeks"
        />
        <div className="flex gap-4">
          <Button variant="contained" type="submit" className="">
            <span className="material-symbols-outlined align-middle mr-2">
              send
            </span>
            Login
          </Button>
          <Button
            variant="contained"
            type="button"
            onClick={() => router.push("/?signup=T")}
          >
            <span className="material-symbols-outlined align-middle mr-2">
              person
            </span>
            Register
          </Button>
        </div>
        <div className="flex w-full items-center">
          <div className="h-0.5 bg-gray-500 flex-1">&nbsp;</div>
          <div className="m-2 flex-0">OR</div>
          <div className="h-0.5 bg-gray-500 flex-1">&nbsp;</div>
        </div>
        <Button
          variant="contained"
          type="submit"
          onClick={(evt) => {
            evt.preventDefault();
            const form = document.forms[0];
            form["username"].value = "testuser@testuser.com";
            form["password"].value = "testuserpassword";
            form.requestSubmit();
          }}
        >
          <span className="material-symbols-outlined align-middle mr-2">
            login
          </span>
          Login wih Test Account
        </Button>
      </form>
    </div>
  );
}
