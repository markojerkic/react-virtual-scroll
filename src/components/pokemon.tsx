import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

type PokemonPage = {
  next: string;
  results: Pokemon[];
};
type Pokemon = {
  name: string;
  url: string;
};

export const Pokemon = () => {
  const {ref, inView} = useInView();

  const { data, isLoading, isError, fetchNextPage } = useInfiniteQuery({
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

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError || !data) {
    return <div>Error</div>;
  }

  const allPokemon = data.pages.flatMap((page) => page.results);

  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Pokemon" />
      </SelectTrigger>
      <SelectContent>
        {allPokemon.map((pokemon, i) => (
          <SelectItem className="grid grid-cols-4" key={pokemon.name} value={pokemon.name}>
            <small>{i+1}</small>
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
