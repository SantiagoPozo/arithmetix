import type { PropsWithChildren } from "react";

import "./Container.css";

type ContainerVariant = "panel" | "soft";

interface ContainerProps extends PropsWithChildren {
  className?: string;
  variant?: ContainerVariant;
}

export function Container({
  children,
  className,
  variant = "panel",
}: ContainerProps) {
  const classes = ["container", `container--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return <section className={classes}>{children}</section>;
}
