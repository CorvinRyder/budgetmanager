"use client";

import { TextField, Button } from "@mui/material";
import { ChangeEventHandler, useActionState, useState } from "react";
import RegisterAction from "./RegisterAction";
import { useRouter } from "next/navigation";

type FormData = {
  username: string;
  password: string;
  cpassword: string;
  email: string;
};

export default function RegisterForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(RegisterAction, {
    status: -1,
    message: "Pending",
  });

  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
    cpassword: "",
    email: "",
  });

  const onChangeHandler: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (evt) => {
    const newData = { ...formData };
    newData[evt.target.name as keyof FormData] = evt.target.value;
    setFormData(newData);
  };

  if (state?.status === 200)
    return (
      <div className="w-full p-4 text-black text-center flex flex-col gap-4">
        <div className={`border-2 rounded-2xl w-full text-xl py-2 px-4`}>
          You signed up successfully! Please go back to login with your new
          account.
        </div>
        <Button
          variant="contained"
          type="button"
          onClick={() => router.push("/")}
        >
          <span className="material-symbols-outlined align-middle mr-2">
            arrow_back
          </span>
          Go Back
        </Button>
      </div>
    );

  return (
    <div className="w-full p-4 text-black text-center">
      <form
        action={formAction}
        className="flex flex-col gap-3 items-center justify-center "
        onSubmit={(evt) => {
          const form = document.forms[0];
          if (form["password"].value !== form["cpassword"].value) {
            evt.preventDefault();
          } else if (form["password"].value.length <= 8) {
            evt.preventDefault();
          }
        }}
      >
        {isPending && (
          <div>
            <span className="material-symbols-outlined text-5xl! align-middle animate-spin">
              sync
            </span>{" "}
            <span className="text-2xl">Signing Up...</span>
          </div>
        )}
        {!isPending && state?.status !== -1 && (
          <div
            className={`border-2 $"border-red-400 rounded-2xl w-full text-red-400 text-xl py-2 px-4`}
          >
            {state?.message}
          </div>
        )}

        <TextField
          name="username"
          defaultValue={formData.username}
          label="User Name"
          onChange={onChangeHandler}
          required
        />
        <TextField
          name="email"
          defaultValue={formData.email}
          label="Email Address"
          type="email"
          onChange={onChangeHandler}
          required
        />
        <TextField
          name="password"
          defaultValue={formData.password}
          label="Password"
          type="password"
          onChange={onChangeHandler}
          required
        />
        <TextField
          name="cpassword"
          defaultValue={formData.cpassword}
          label="Confirm Password"
          type="password"
          onChange={onChangeHandler}
          required
        />
        <div className="flex gap-4">
          <Button variant="contained" type="submit">
            <span className="material-symbols-outlined align-middle mr-2">
              send
            </span>
            Submit
          </Button>
          <Button
            variant="contained"
            type="button"
            onClick={() => router.push("/")}
          >
            <span className="material-symbols-outlined align-middle mr-2">
              arrow_back
            </span>
            Go Back
          </Button>
        </div>
      </form>
    </div>
  );
}
