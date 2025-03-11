"use client";

import { useChain } from "@cosmos-kit/react";

export function ConnectWallet() {
  const { address, status, username, connect, disconnect } =
    useChain("injectivetestnet");

  return (
    <div className="flex flex-col gap-5 p-5">
      <button
        className="bg-slate-200 hover:bg-purple-400 max-w-80"
        onClick={() => {
          connect();
        }}
      >
        Connect
      </button>
  {/* <button
        className="bg-slate-200 hover:bg-purple-400 max-w-80"
        onClick={() => {
          disconnect();
        }}
      >
        Disconnect
      </button>*/}
    </div>
  );
}
