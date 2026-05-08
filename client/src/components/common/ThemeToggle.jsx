import { useDispatch, useSelector } from "react-redux";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleTheme } from "@/store/slices/themeSlice";

export default function ThemeToggle() {
  const mode = useSelector((s) => s.theme.mode);
  const dispatch = useDispatch();
  return (
    <Button variant="ghost" size="icon" onClick={() => dispatch(toggleTheme())} aria-label="Toggle theme">
      {mode === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
