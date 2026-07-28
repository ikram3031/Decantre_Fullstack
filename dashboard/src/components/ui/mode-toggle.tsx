import { Laptop, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useTheme } from "@/components/theme-provider"

type ThemeMode = "light" | "dark" | "system"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <ToggleGroup
      type="single"
      value={theme}
      onValueChange={(value) => {
        if (value) {
          setTheme(value as ThemeMode)
        }
      }}
      className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1"
      aria-label="Theme mode"
    >
      <ToggleGroupItem value="light" asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-slate-600 dark:text-slate-300 data-[state=on]:bg-white data-[state=on]:text-slate-900 dark:data-[state=on]:bg-slate-800 dark:data-[state=on]:text-white"
        >
          <Sun className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Light</span>
        </Button>
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-slate-600 dark:text-slate-300 data-[state=on]:bg-white data-[state=on]:text-slate-900 dark:data-[state=on]:bg-slate-800 dark:data-[state=on]:text-white"
        >
          <Moon className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Dark</span>
        </Button>
      </ToggleGroupItem>
      <ToggleGroupItem value="system" asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-slate-600 dark:text-slate-300 data-[state=on]:bg-white data-[state=on]:text-slate-900 dark:data-[state=on]:bg-slate-800 dark:data-[state=on]:text-white"
        >
          <Laptop className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">System</span>
        </Button>
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
