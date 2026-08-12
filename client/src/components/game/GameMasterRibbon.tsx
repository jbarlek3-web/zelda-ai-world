import React from "react";

export function GameMasterRibbon({ text }: { readonly text: string | null }) {
  if (!text) return null;
  return <aside role="status" className="pointer-events-none fixed inset-x-6 bottom-[13rem] z-20 rounded-sm border border-[#69ddd4]/35 bg-[#08251e]/90 px-3 py-2 text-center text-xs leading-5 text-[#d8e4ca] shadow-[0_12px_34px_rgba(0,0,0,0.42)] backdrop-blur-sm sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96">{text}</aside>;
}
