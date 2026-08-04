import { createContext, useContext, useState, ReactNode } from "react";

type NavState = {
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
};

const Ctx = createContext<NavState>({ drawerOpen: false, setDrawerOpen: () => {} });
export const useNav = () => useContext(Ctx);

export function NavProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return <Ctx.Provider value={{ drawerOpen, setDrawerOpen }}>{children}</Ctx.Provider>;
}
