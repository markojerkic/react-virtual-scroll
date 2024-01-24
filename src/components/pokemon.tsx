import { useInfiniteQuery } from "@tanstack/react-query";

type PokemonPage = {
  next: string;
  results: Pokemon[];
};
type Pokemon = {
  name: string;
  url: string;
};

export const Pokemon = () => {
  const { data, isLoading, isError } = useInfiniteQuery({
    queryKey: ["pokemon"],
    queryFn: async ({ pageParam }) => {
      return fetch(pageParam).then((res) => res.json() as Promise<PokemonPage>);
    },
    initialPageParam: "https://pokeapi.co/api/v2/pokemon",
    getNextPageParam: (lastPage: PokemonPage) => {
      return lastPage.next;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError || !data) {
    return <div>Error</div>;
  }

  return (
    <main className="">
      <h1 className="text-xl">Pokemon</h1>

      <ul>
        {data?.pages.map((page) =>
          page.results.map((pokemon) => (
            <li key={pokemon.name}>
              <p>{pokemon.name}</p>
              <img src={pokemon.url} alt={pokemon.name} />
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
