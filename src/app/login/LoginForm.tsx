"use client";

import HandleLogin from "./LoginAction";

export default function () {
  return (
    <div className="gap-3 items-center justify-center flex w-full p-4 rounded-2xl text-xl border border-gray-600 text-black text-center">
      <form action={HandleLogin}>
        <input type="hidden" name="username" value="test-user" />
        <input type="hidden" name="password" value="test-password" />
        <input type="submit" value="Test Login Button" />
      </form>
    </div>
  );
}
