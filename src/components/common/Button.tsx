import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

import "./Button.css";

type ButtonVariant = "primary" | "secondary";

type ButtonSize = "md" | "lg";

interface ButtonProps
  extends PropsWithChildren, ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  children,
  className,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const classes = ["button", `button--${variant}`, `button--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}
