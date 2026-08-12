import { cn } from "@/lib/utils";

type LogoMarkProps = {
  className?: string;
};

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("select-none text-lg font-black leading-none tracking-tighter", className)}
    >
      U
    </span>
  );
}
