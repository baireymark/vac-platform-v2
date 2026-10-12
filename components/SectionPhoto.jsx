// A faded military photo behind a light section's content, so the section isn't flat. Decorative only.
// Placement, fade and strength are per section in globals.css (.sec__photo--<name>).
import Image from "next/image";

export default function SectionPhoto({ name, src, sizes = "(max-width: 860px) 100vw, 60vw" }) {
  return (
    <div className={`sec__photo sec__photo--${name}`} aria-hidden="true">
      <Image src={src} alt="" fill sizes={sizes} />
    </div>
  );
}
