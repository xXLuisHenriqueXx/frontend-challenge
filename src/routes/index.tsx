import { createFileRoute } from "@tanstack/react-router";
import { SearchBar } from "./-components/SearchBar";
import { Header } from "./-components/Header";
import { Hero } from "./-components/Hero";
import { Sidebar } from "./-components/Sidebar";
import { Categories } from "./-components/Categories";
import { SortSelect } from "./-components/SortSelect";
import { Products } from "./-components/Products";
import { Pagination } from "./-components/Pagination";
import { BottomBar } from "./-components/BottomBar";
import { Promos } from "./-components/Promos";
import { Blog } from "./-components/Blog";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <>
      <Header />

      <main className="mx-auto flex flex-col gap-12 w-full max-w-300 min-h-dvh px-6 pt-10 pb-40 overflow-y-auto lg:px-8 lg:pt-8 lg:pb-16 lg:overflow-visible">
        <SearchBar />
        <Hero />

        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-8">
          <Sidebar />

          <div className="flex flex-col gap-12 min-w-0 lg:gap-6">
            <div className="-my-8 flex items-center justify-between gap-4 lg:my-0">
              <Categories />
              <SortSelect />
            </div>

            <Products />
            <Pagination />
          </div>
        </div>

        <Promos />
        <Blog />
        <Footer />
        <BottomBar />
      </main>
    </>
  );
}
