import { useEffect } from "react";

/**
 * SecurityWrapper
 * Adds basic client-side protection against casual copying and inspection.
 * Note: This cannot stop determined reverse-engineers, but deters casual scraping.
 */
export function SecurityWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Disable common developer keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12
      if (e.key === "F12") {
        e.preventDefault();
      }
      
      // Prevent Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect)
      if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) {
        e.preventDefault();
      }
      
      // Prevent Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
      }

      // Prevent Ctrl+P (Print)
      if (e.ctrlKey && (e.key === "P" || e.key === "p")) {
        e.preventDefault();
      }

      // Prevent Ctrl+S (Save Page)
      if (e.ctrlKey && (e.key === "S" || e.key === "s")) {
        e.preventDefault();
      }
    };

    // Disable text selection and copying
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("copy", handleCopy);

    // Add unselectable CSS globally
    document.body.style.userSelect = "none";
    document.body.style.WebkitUserSelect = "none";

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("copy", handleCopy);
      document.body.style.userSelect = "";
      document.body.style.WebkitUserSelect = "";
    };
  }, []);

  return <>{children}</>;
}
