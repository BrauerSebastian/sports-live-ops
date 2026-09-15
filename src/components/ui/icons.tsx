import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function IconBase({ size = 18, strokeWidth = 1.75, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </IconBase>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6.25 9a5.75 5.75 0 1 1 11.5 0c0 6.5 2.25 7.25 2.25 7.25H4S6.25 15.5 6.25 9" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </IconBase>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m6 9 6 6 6-6" />
    </IconBase>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m9 6 6 6-6 6" />
    </IconBase>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M14 5h5v5" />
      <path d="M10 14 19 5" />
      <path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </IconBase>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 10.5 12 4l9 6.5" />
      <path d="M5 10v9h5v-5h4v5h5v-9" />
    </IconBase>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 3v3" />
      <path d="M17 3v3" />
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16" />
    </IconBase>
  );
}

export function TrophyIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 4h8v3a4 4 0 0 1-8 0Z" />
      <path d="M10 14h4" />
      <path d="M12 10v4" />
      <path d="M9 20h6" />
      <path d="M7 4H4v2a4 4 0 0 0 4 4" />
      <path d="M17 4h3v2a4 4 0 0 1-4 4" />
    </IconBase>
  );
}

export function BroadcastIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="1.6" />
      <path d="M16.7 7.3a6.7 6.7 0 0 1 0 9.4" />
      <path d="M7.3 16.7a6.7 6.7 0 0 1 0-9.4" />
      <path d="M19.5 4.5a10.6 10.6 0 0 1 0 15" />
      <path d="M4.5 19.5a10.6 10.6 0 0 1 0-15" />
    </IconBase>
  );
}

export function FileTextIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </IconBase>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 20s6-5.33 6-10a6 6 0 1 0-12 0c0 4.67 6 10 6 10Z" />
      <circle cx="12" cy="10" r="2" />
    </IconBase>
  );
}

export function SoccerBallIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="m12 7 2.6 1.9-1 3.1h-3.2l-1-3.1L12 7Z" fill="currentColor" stroke="currentColor" strokeWidth="0.4" />
      <path d="m9.4 8.9-2.6.4-1.4 2.5 1.5 2.6 2.5.4" stroke="currentColor" strokeWidth="1.2" />
      <path d="m14.6 8.9 2.6.4 1.4 2.5-1.5 2.6-2.5.4" stroke="currentColor" strokeWidth="1.2" />
      <path d="m9.5 15-1 2.5 2.7 1.6h1.6l2.7-1.6-1-2.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function FootballIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <ellipse cx="12" cy="12" rx="8" ry="5.5" transform="rotate(-25 12 12)" />
      <path d="M10.25 9.75h3.5" />
      <path d="M10 11.25h4" />
      <path d="M10.25 12.75h3.5" />
      <path d="M8.75 8.75 10 14.25" />
      <path d="M15.25 9.75 14 15.25" />
    </IconBase>
  );
}
