import type { ReactNode, SVGProps } from "react";
import { UserRound } from "lucide-react";
import type { VoiceGender } from "@/types/voice";

/** Restroom-style male silhouette — clearer than ♂ / Mars */
export function MalePersonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <circle cx="12" cy="5.5" r="2.5" />
      <path d="M12 8.5v5.5" />
      <path d="M9 22v-5l3-3 3 3v5" />
      <path d="M8.5 12.5h7" />
    </svg>
  );
}

/** Restroom-style female silhouette — clearer than ♀ / Venus */
export function FemalePersonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <circle cx="12" cy="5.5" r="2.5" />
      <path d="M12 8.5 8 16h8l-4-7.5Z" />
      <path d="M10 22v-4h4v4" />
    </svg>
  );
}

export function GenderIcon({
  gender,
  className,
}: {
  gender: VoiceGender;
  className?: string;
}): ReactNode {
  if (gender === "masculine") return <MalePersonIcon className={className} />;
  if (gender === "feminine") return <FemalePersonIcon className={className} />;
  return <UserRound className={className} strokeWidth={2.25} aria-hidden />;
}
