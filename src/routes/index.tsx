import { parseSearch } from "@/features/catalog/api/search";
import { Blog } from "@/features/catalog/components/blog";
import { Categories } from "@/features/catalog/components/categories";
import { Hero } from "@/features/catalog/components/hero";
import { Pagination } from "@/features/catalog/components/pagination";
import { Products } from "@/features/catalog/components/products";
import { Promos } from "@/features/catalog/components/promos";
import { SearchBar } from "@/features/catalog/components/search-bar";
import { Sidebar } from "@/features/catalog/components/sidebar";
import { SortSelect } from "@/features/catalog/components/sort-select";
import { BottomBar } from "@/shared/components/bottom-bar";
import { Footer } from "@/shared/components/site-footer";
import { Header } from "@/shared/components/site-header";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  validateSearch: parseSearch,
  component: Home,
});

function Home() {
  return (
    <>
      <Header />

      <main className="catalog-page mx-auto flex flex-col gap-12 w-full max-w-300 min-h-dvh px-6 pt-10 pb-12 overflow-y-auto lg:px-8 lg:pt-8 lg:pb-12 lg:overflow-visible">
        <SearchBar />
        <Hero />

        <div className="catalog-layout flex flex-col gap-12 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-8">
          <Sidebar />

          <div className="flex flex-col gap-12 min-w-0 lg:gap-6">
            <div className="catalog-controls flex flex-wrap items-center justify-between gap-4">
              <Categories />
              <SortSelect />
            </div>

            <Products />
            <Pagination />
          </div>
        </div>

        <Promos />
        <Blog />
      </main>
      <div className="mx-auto w-full max-w-300 px-6 pb-40 lg:px-8 lg:pb-16">
        <Footer />
      </div>
      <BottomBar />
    </>
  );
}
