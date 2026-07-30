
import type { MouseEventHandler, ReactNode } from "react";

export interface hrefType {
  children: ReactNode;
  href: string;
  onClick: MouseEventHandler<HTMLAnchorElement>;
}