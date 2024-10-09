"use client";

import { createContext, useContext } from "react";

import { Config } from "@/lib/config";

const configCtx = createContext<Config>({} as Config);

export const ConfigProvider = configCtx.Provider;

export const useConfig = () => {
  return useContext(configCtx);
};
