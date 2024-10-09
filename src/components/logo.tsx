import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/">
      <Image
        className="sm:hidden dark:invert-0 invert hover:cursor-pointer"
        src="/healthlab.png"
        alt="Logo"
        height={28}
        width={28}
      />
      <Image
        className="hidden sm:block dark:invert-0 invert hover:cursor-pointer"
        src="/healthlab-full.png"
        alt="Logo"
        width={180}
        height={35}
      />
    </Link>
  );
}
