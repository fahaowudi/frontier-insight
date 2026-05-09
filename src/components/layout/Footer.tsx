import Link from "next/link";

interface FooterProps {
  locale: string;
  dict: Record<string, unknown>;
  siteName: string;
}

export function Footer({ locale, dict, siteName }: FooterProps) {
  const d = dict as {
    footer: {
      archive: string;
      rss: string;
      methodology: string;
      privacy: string;
    };
  };

  return (
    <footer className="hidden sm:block border-t border-border/60 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <Link
            href={`/${locale}/archive`}
            className="hover:text-primary transition-colors"
          >
            {d.footer.archive}
          </Link>
          <Link
            href={`/${locale}/feed.xml`}
            className="hover:text-primary transition-colors"
          >
            {d.footer.rss}
          </Link>
          <Link
            href={`/${locale}/methodology`}
            className="hover:text-primary transition-colors"
          >
            {d.footer.methodology}
          </Link>
          <span className="hover:text-primary transition-colors cursor-default">
            {d.footer.privacy}
          </span>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground/50">
          &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
