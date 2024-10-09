import clsx from "clsx";
import Image from "next/image";

type Props = {
  src?: string | undefined | null;
  fallback?: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
};

export default function Avatar({ src, alt, className, fallback, width = 28, height = 28 }: Props) {
  return (
    <div className={clsx(`rounded-full overflow-hidden cursor-pointer`, className)}>
      {src && <Image src={src} height={height} width={width} alt={alt} />}
      {!src && <span>{fallback}</span>}
    </div>
  );
}
