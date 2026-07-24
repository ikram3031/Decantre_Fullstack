import React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { useApp } from "../../context/AppContext";

// Self-contained, lightweight classname utility
const cn = (...classes) => classes.filter(Boolean).join(" ");

const Button = React.forwardRef(({
  className,
  variant = "primary", // "primary" | "secondary" | "outline" | "ghost"
  size = "md", // "sm" | "md" | "lg"
  theme, // optional explicit override: "dark" | "light"
  children,
  ...props
}, ref) => {
  let activeTheme = "dark";
  
  try {
    const context = useApp();
    activeTheme = theme || context.currentTheme || "dark";
  } catch (e) {
    // Fallback if rendered outside Context
    activeTheme = theme || "dark";
  }

  // Define precise luxury design styles for each theme
  const themeStyles = {
    dark: {
      primary: "bg-black text-[#C5A059] border border-[#C5A059] hover:bg-[#C5A059] hover:text-black shadow-[0_0_15px_rgba(197,160,89,0.12)]",
      secondary: "bg-[#111111] text-zinc-300 border border-white/10 hover:border-[#C5A059] hover:text-[#C5A059]",
      outline: "bg-transparent text-[#C5A059] border border-[#C5A059]/40 hover:border-[#C5A059] hover:bg-[#C5A059]/5",
      ghost: "bg-transparent text-zinc-400 hover:text-[#C5A059] hover:bg-[#C5A059]/5 border border-transparent"
    },
    light: {
      primary: "bg-black text-white border border-black hover:bg-zinc-800 shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
      secondary: "bg-zinc-100 text-black border border-zinc-200 hover:bg-zinc-200",
      outline: "bg-transparent text-black border border-black hover:bg-black/5",
      ghost: "bg-transparent text-zinc-700 hover:text-black hover:bg-black/5 border border-transparent"
    }
  };

  const sizeStyles = {
    sm: "h-9 px-4 text-[10px] tracking-[0.2em]",
    md: "h-11 px-6 text-xs tracking-[0.25em]",
    lg: "h-13 px-8 text-sm tracking-[0.3em]"
  };

  const chosenTheme = themeStyles[activeTheme] || themeStyles.dark;
  const chosenVariant = chosenTheme[variant] || chosenTheme.primary;
  const chosenSize = sizeStyles[size] || sizeStyles.md;

  return (
    <ButtonPrimitive
      ref={ref}
      data-slot="button"
      className={cn(
        "inline-flex items-center justify-center font-sans font-bold uppercase transition-all duration-300 rounded-[4px] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#C5A059]/40 select-none disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
        chosenVariant,
        chosenSize,
        className
      )}
      {...props}
    >
      {children}
    </ButtonPrimitive>
  );
});

Button.displayName = "Button";

export { Button };
