import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInView } from "react-intersection-observer";
import { ElementRef, useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

type PokemonPage = {
  next: string;
  results: Pokemon[];
};
type Pokemon = {
  name: string;
  url: string;
};

export const Pokemon = () => {
  const { ref, inView } = useInView();
  const virtualizerRef = useRef<ElementRef<"div">>(null);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["pokemon"],
    queryFn: async ({ pageParam }) => {
      const url = new URL(pageParam);
      url.searchParams.set("limit", "200");
      return fetch(url.toString()).then((res) => res.json() as Promise<PokemonPage>);
    },
    initialPageParam: "https://pokeapi.co/api/v2/pokemon?limit=200",
    getNextPageParam: (lastPage: PokemonPage) => {
      return lastPage.next;
    },
  });

  const allPokemon = data?.pages.flatMap((page) => page.results) ?? [];

  const virtualizer = useVirtualizer({
    count: hasNextPage ? allPokemon?.length + 1 : allPokemon?.length,
    estimateSize: () => 600,
    overscan: 5,
    getScrollElement: () => virtualizerRef.current
  });

  useEffect(() => {
    const [lastItem] = [...virtualizer.getVirtualItems()].reverse()

    if (!lastItem) {
      return
    }

    if (
      lastItem.index >= allPokemon.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage()
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allPokemon.length,
    isFetchingNextPage,
    virtualizer.getVirtualItems(),
  ])

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError || !allPokemon) {
    return <div>Error</div>;
  }

  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Pokemon" />
      </SelectTrigger>
      <SelectContent ref={virtualizerRef}>
        {virtualizer.getVirtualItems().map(index => allPokemon[index.index]).map((pokemon, i) => (
          <SelectItem className="grid grid-cols-4" key={pokemon.name} value={pokemon.name}>
            <small>{i + 1}</small>
            <img
              className="col-span-1 w-13 h-12"
              src={`https://img.pokemondb.net/sprites/home/normal/${pokemon.name}.png`}
              alt={pokemon.name}
            />
            <span className="col-span-3">{pokemon.name}</span>
          </SelectItem>
        ))}
        <div ref={ref} />
      </SelectContent>
    </Select>
  );
};
