import { ElementRef, ReactNode, useEffect, useRef, useState } from "react";
import * as Select from "@radix-ui/react-select";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";

const SelectItem = ({
  children,
  value,
}: {
  children: ReactNode;
  value: string;
}) => {
  return (
    <Select.Item
      className="text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-mauve8 hover:bg-mauve3  data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1"
      value={value}
    >
      {children}
    </Select.Item>
  );
};

type PokemonPage = {
  next: string;
  results: Pokemon[];
};
type Pokemon = {
  name: string;
  url: string;
};

const InsidePortal = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["pokemon"],
    queryFn: async ({ pageParam }) => {
      return fetch(pageParam).then(
        (res) => res.json() as Promise<PokemonPage>
      );
    },
    staleTime: Infinity,
    initialPageParam: "https://pokeapi.co/api/v2/pokemon?limit=100",
    getNextPageParam: (lastPage: PokemonPage) => {
      return lastPage.next;
    },
  });
  const virtualizerRef = useRef<ElementRef<"div">>(null);

  const allPokemon = data?.pages.flatMap((page) => page.results) ?? [];

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allPokemon?.length + 1 : allPokemon?.length,
    estimateSize: () => 50,
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

  return (
    <div className="h-96 overflow-y-scroll" ref={virtualizerRef}>
      <div className="relative w-full"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const pokemon = allPokemon[virtualRow.index];

          if (!pokemon) {
            return null;
          }

          return (
            <div
              key={virtualRow.index}
              style={{
                position: "absolute",
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <SelectItem value={pokemon.name}>
                {virtualRow.index}
                <img
                  src={`https://img.pokemondb.net/sprites/home/normal/${pokemon.name}.png`}
                  className="w-[25px] h-[25px] mr-[5px]"
                />
                <span>{pokemon.name}</span>
              </SelectItem>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SelectDemo = () => {
  const [value, setValue] = useState("apple");

  return (
    <Select.Root onValueChange={setValue}>
      <Select.Trigger
        className="inline-flex items-center justify-around rounded px-[15px] text-[13px] leading-none h-[35px] gap-[5px] bg-white text-violet11 shadow-[0_2px_10px] shadow-black/10 hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-black data-[placeholder]:text-violet9 outline-none min-w-96  min-h-fit py-4"
        aria-label="Food"
      >
        <Select.Value
          placeholder="Select a fruit…"
          className="flex w-full justify-between"
        >
          <span className="inline-flex items-center justify-around">
            <img
              src={`https://img.pokemondb.net/sprites/home/normal/${value}.png`}
              className="w-[25px] h-[25px]"
            />
            <span>{value}</span>
          </span>
        </Select.Value>
        <Select.Icon className="text-violet11"></Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="overflow-hidden bg-white rounded-md shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] min-w-96">
          <Select.Viewport className="p-[5px]">
            <Select.Group className="w-full">
              <Select.Label className="px-[25px] text-xs leading-[25px] text-mauve11">
                Fruits
              </Select.Label>

              <InsidePortal />
            </Select.Group>
          </Select.Viewport>
          <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default"></Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

export const Pokemon = () => {
  return <SelectDemo />;
};
