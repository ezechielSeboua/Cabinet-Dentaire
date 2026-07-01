import { useSidebar } from "../context/SidebarContext";

// Returns the responsive left-margin classes that keep page content clear of
// SideBar2, reacting to its open/collapsed/mobile-hidden state instead of a
// hardcoded md:ml-64.
export function useSidebarMargin() {
  const { open, isMobile } = useSidebar();
  if (isMobile) return "";
  return open ? "md:ml-64" : "md:ml-16";
}
