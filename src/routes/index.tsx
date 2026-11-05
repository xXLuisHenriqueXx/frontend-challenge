import { createFileRoute } from "@tanstack/react-router";
import { SearchBar } from "./-components/SearchBar";
import { Hero } from "./-components/Hero";
import { Categories } from "./-components/Categories";
import { Products } from "./-components/Products";
import { BottomBar } from "./-components/BottomBar";
import { Promos } from "./-components/Promos";
import { Blog } from "./-components/Blog";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="flex flex-col gap-12 w-full min-h-dvh px-6 pt-10 pb-40 overflow-y-auto">
      <SearchBar />
      <Hero />
      <Categories />
      <Products />
      <Promos />
      <Blog />
      <BottomBar />
    </main>
  );
}
