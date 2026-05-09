import { loadDictionary } from "@/lib/i18n";
import { SearchResults } from "@/components/search/SearchResults";

export default async function SearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = loadDictionary(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <h1 className="font-heading text-2xl font-bold mb-6">
        {dict.search.title}
      </h1>
      <SearchResults locale={locale} />
    </div>
  );
}
