import { useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import { store } from "@/store";

function ThemeApplier({ children }) {
  const mode = useSelector((s) => s.theme.mode);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
  }, [mode]);
  return children;
}

export default function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <ThemeApplier>{children}</ThemeApplier>
    </Provider>
  );
}
