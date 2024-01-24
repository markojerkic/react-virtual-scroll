import { useInfiniteQuery } from "@tanstack/react-query";
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
  // const { ref, inView } = useInView();
  const virtualizerRef = useRef<ElementRef<"div">>(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["pokemon"],
    queryFn: async ({ pageParam }) => {
      const url = new URL(pageParam);
      url.searchParams.set("limit", "20");
      return fetch(url.toString()).then(
        (res) => res.json() as Promise<PokemonPage>
      );
    },
    initialPageParam: "https://pokeapi.co/api/v2/pokemon?limit=200",
    getNextPageParam: (lastPage: PokemonPage) => {
      return lastPage.next;
    },
  });

  const allPokemon = data?.pages.flatMap((page) => page.results) ?? [];

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allPokemon?.length + 1 : allPokemon?.length,
    estimateSize: () => 5,
    overscan: 5,
    getScrollElement: () => virtualizerRef.current,
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= allPokemon.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allPokemon.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError || !allPokemon) {
    return <div>Error</div>;
  }

  return (
    <div className="overflow-y-auto h-96" ref={virtualizerRef}>
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}rem`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer
            .getVirtualItems()
            .filter((virtualRow) => virtualRow.index < allPokemon.length)
            .map((virtualRow) => {
              console.log("virtualka", virtualRow.index)
              return {
                virtualRow,
                pokemon: allPokemon[virtualRow.index],
              }
            })
            .map(({ virtualRow, pokemon }) => (
              <div
                className="grid"
                key={virtualRow.index}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: `${virtualRow.size}rem`,
                  transform: `translateY(${virtualRow.start}rem)`,
                }}
              >
                <span className="col-span-1">{virtualRow.index}</span>
                <img
                  className="col-span-1 w-13 h-12"
                  src={`https://img.pokemondb.net/sprites/home/normal/${pokemon.name}.png`}
                  alt={pokemon.name}
                />
                <span className="col-span-3">{pokemon.name}</span>
              </div>
            ))}
        </div>
      </div>
  );
};
