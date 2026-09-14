import Link from "next/link";
import { ConsentPreferencesButton } from "@/components/privacy/ConsentPreferencesButton";

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <span>Sports Live Ops / Fictional competition data / Portfolio demonstration</span>
      <nav aria-label="Legal">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <ConsentPreferencesButton />
      </nav>
    </footer>
  );
}
