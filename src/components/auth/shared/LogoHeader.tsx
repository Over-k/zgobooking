import Image from "next/image";

interface LogoHeaderProps {
  heading: string;
  subheading?: string;
  logo: {
    url: string;
    src: string;
    alt: string;
    title?: string;
  };
}

export function LogoHeader({ heading, subheading, logo }: LogoHeaderProps) {
  return (
    <div className="mb-6 flex flex-col items-center">
      <a href={logo.url} className="mb-6 flex items-center gap-2">
        {/* Using Next.js Image component for better performance */}
        <img src={logo.src} className="max-h-8" alt={logo.alt} />
      </a>
      <h1 className="mb-2 text-2xl font-bold">{heading}</h1>
      {subheading && <p className="text-muted-foreground">{subheading}</p>}
    </div>
  );
}
