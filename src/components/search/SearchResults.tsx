"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

interface SearchHit {
  url: string;
  title: string;
  excerpt: string;
  meta: {
    date?: string;
  };
}

interface PagefindAPI {
  init: () => Promise<void>;
  search: (
    query: string,
    options?: { filters?: Record<string, string[]> },
  ) => Promise<{ results: { data: () => Promise<Record<string, unknown>> }[] }>;
}

export function SearchResults({ locale }: { locale: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [pf, setPf] = useState<PagefindAPI | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    // Load pagefind via script tag to avoid bundler resolution issues
    if (document.querySelector('script[src="/pagefind/pagefind.js"]')) return;

    const script = document.createElement("script");
    script.src = "/pagefind/pagefind.js";
    script.async = true;
    script.onload = () => {
      const pagefind = (window as unknown as Record<string, unknown>)
        .pagefind as PagefindAPI | undefined;
      if (pagefind) {
        pagefind.init().then(() => setPf(pagefind));
      }
    };
    document.head.appendChild(script);
  }, []);

  const doSearch = useCallback(
    async (q: string) => {
      if (!pf || !q.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const search = await pf.search(q, {
          filters: { locale: [locale] },
        });
        const hits: SearchHit[] = [];
        for (const result of search.results) {
          const data = (await result.data()) as Record<string, unknown>;
          const meta = (data.meta as Record<string, unknown>) || {};
          hits.push({
            url: data.url as string,
            title: (meta.title as string) || (data.url as string),
            excerpt: (data.excerpt as string) || "",
            meta: {
              date: meta.date as string | undefined,
            },
          });
        }
        setResults(hits);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [pf, locale],
  );

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={locale === "zh" ? "搜索文章..." : "Search articles..."}
          className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
        />
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground">
          {locale === "zh" ? "搜索中..." : "Searching..."}
        </p>
      )}

      {!loading && query && results.length === 0 && pf && (
        <p className="text-sm text-muted-foreground">
          {locale === "zh" ? "未找到相关结果" : "No results found"}
        </p>
      )}

      {!loading && !pf && (
        <p className="text-xs text-muted-foreground/60">
          {locale === "zh"
            ? "搜索功能在构建后可用（运行 build 命令生成索引）"
            : "Search available after build (run build to generate index)"}
        </p>
      )}

      <ul className="space-y-2">
        {results.map((hit) => (
          <li key={hit.url}>
            <Link
              href={hit.url}
              className="block rounded-lg border border-border/80 bg-card p-4 hover:border-primary/20 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                {hit.meta.date && (
                  <time className="font-mono">{hit.meta.date}</time>
                )}
              </div>
              <h3 className="font-heading font-medium text-sm leading-snug">
                {hit.title}
              </h3>
              {hit.excerpt && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {hit.excerpt}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
