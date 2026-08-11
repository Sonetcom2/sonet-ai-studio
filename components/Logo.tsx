import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <Image
        src="/sonet-ai-studio-logo.png"
        alt="SONET AI STUDIO"
        width={360}
        height={110}
        priority
        unoptimized
        className="h-auto w-[300px] object-contain"
      />
    </Link>
  );
}