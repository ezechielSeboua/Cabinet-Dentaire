import { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext();

const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);
  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, [breakpoint]);
  return isMobile;
};

export function SidebarProvider({ children }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(!isMobile);

  // Auto-close on mobile, auto-open on desktop
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  return (
    <SidebarContext.Provider value={{ open, setOpen, isMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
