"use client";

import HandleLogin from "./LoginAction";
import { useActionState } from "react";

export default function () {
  const [state, formAction, isPending] = useActionState(HandleLogin, {
    status: 200,
    message: "Pending",
  });

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
        <input type="hidden" name="username" value="test-user" />
        <input type="hidden" name="password" value="test-password" />
        <input
          type="submit"
          value="Test Login Button"
          className="rounded-2xl text-xl border border-gray-600 py-2 px-4"
        />
        <input
          type="submit"
          value="Test Login Button (Wrong)"
          className="rounded-2xl text-xl border border-gray-600 py-2 px-4"
          onClick={() => {
            window.document.forms[0]["username"].value = "wrong-user";
            return true;
          }}
        />
      </form>
    </div>
  );
}
