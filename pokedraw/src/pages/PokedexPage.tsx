import { useEffect, useState } from "react";

type PokemonType = string;

interface PokemonListItem {
    id: number;
    nameFr: string;
}

interface PokemonDetails {
    id: number;
    nameFr: string;
    types: PokemonType[];
    mainType: PokemonType;
    weightKg: number;
    heightM: number;
    frontImg: string;
    backImg: string;
}

const TYPE_TRANSLATIONS: Record<string, string> = {
    normal: "Normal",
    fighting: "Combat",
    flying: "Vol",
    poison: "Poison",
    ground: "Sol",
    rock: "Roche",
    bug: "Insecte",
    ghost: "Spectre",
    steel: "Acier",
    fire: "Feu",
    water: "Eau",
    grass: "Plante",
    electric: "Électrik",
    psychic: "Psy",
    ice: "Glace",
    dragon: "Dragon",
    dark: "Ténèbres",
    fairy: "Fée",
};

const TYPE_COLORS: Record<string, string> = {
    normal: "#BABAAE",
    fighting: "#A75543",
    flying: "#78A2FF",
    poison: "#A95CA0",
    ground: "#EECC55",
    rock: "#CCBD72",
    bug: "#C2D21E",
    ghost: "#7975D7",
    steel: "#C4C2DB",
    fire: "#FA5643",
    water: "#56ADFF",
    grass: "#8CD750",
    electric: "#FDE139",
    psychic: "#FA65B4",
    ice: "#96F1FF",
    dragon: "#8673FF",
    dark: "#8D6855",
    fairy: "#F9AEFF",
};

const initialUrl = "https://pokeapi.co/api/v2/pokemon?offset=0&limit=20";

const PokedexPage = () => {
    const [list, setList] = useState<PokemonListItem[]>([]);
    const [selected, setSelected] = useState<PokemonDetails | null>(null);
    const [prevUrl, setPrevUrl] = useState<string | null>(null);
    const [nextUrl, setNextUrl] = useState<string | null>(null);
    const [loadingList, setLoadingList] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Récupère la liste + noms FR
    const fetchList = async (url: string) => {
        try {
            setLoadingList(true);
            setError(null);
            const res = await fetch(url);
            const data = await res.json();

            setPrevUrl(data.previous);
            setNextUrl(data.next);

            const items: PokemonListItem[] = await Promise.all(
                data.results.map(async (result: { name: string; url: string }) => {
                    const urlParts = result.url.split("/");
                    const id = Number(urlParts[urlParts.length - 2]);

                    const speciesRes = await fetch(
                        `https://pokeapi.co/api/v2/pokemon-species/${id}`
                    );
                    const speciesData = await speciesRes.json();
                    const frNameObj = speciesData.names.find(
                        (n: { language: { name: string }; name: string }) =>
                            n.language.name === "fr"
                    );
                    const nameFr = frNameObj?.name ?? result.name;

                    return { id, nameFr };
                })
            );

            setList(items);

            // si aucun Pokémon sélectionné encore, on prend le premier
            if (!selected && items.length > 0) {
                void fetchDetails(items[0].id);
            }
        } catch (err) {
            console.error(err);
            setError("Erreur lors du chargement de la liste.");
        } finally {
            setLoadingList(false);
        }
    };

    // Détails d’un Pokémon
    const fetchDetails = async (id: number) => {
        try {
            setLoadingDetails(true);
            setError(null);

            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const data = await res.json();

            const speciesRes = await fetch(
                `https://pokeapi.co/api/v2/pokemon-species/${id}`
            );
            const speciesData = await speciesRes.json();
            const frNameObj = speciesData.names.find(
                (n: { language: { name: string }; name: string }) =>
                    n.language.name === "fr"
            );

            const types: string[] = data.types.map(
                (t: { type: { name: string } }) => t.type.name
            );
            const mainType = types[0] ?? "normal";

            const details: PokemonDetails = {
                id: data.id,
                nameFr: frNameObj?.name ?? data.name,
                types,
                mainType,
                weightKg: data.weight / 10,
                heightM: data.height / 10,
                frontImg: data.sprites.front_default ?? "",
                backImg: data.sprites.back_default ?? "",
            };

            setSelected(details);
        } catch (err) {
            console.error(err);
            setError("Erreur lors du chargement du Pokémon.");
        } finally {
            setLoadingDetails(false);
        }
    };

    useEffect(() => {
        void fetchList(initialUrl);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePrev = () => {
        if (prevUrl) void fetchList(prevUrl);
    };

    const handleNext = () => {
        if (nextUrl) void fetchList(nextUrl);
    };

    const mainBg =
        selected && TYPE_COLORS[selected.mainType]
            ? TYPE_COLORS[selected.mainType]
            : "#BABAAE";

    return (
        <div className="mt-10 flex justify-center">
            <div className="flex w-full max-w-5xl gap-6">
                {/* Partie gauche : écran principal */}
                <div className="flex-1 bg-[#E71D23] rounded-3xl border-4 border-black overflow-hidden shadow-lg">
                    {/* Bandeau haut */}
                    <div className="flex items-center gap-4 border-b-4 border-black px-4 py-3">
                        <div className="h-8 w-8 rounded-full border-2 border-white shadow-inner"
                            style={{
                                background:
                                    "radial-gradient(circle at 8px 8px, #ffffff, #369CD4, #369CD4)",
                            }}
                        />
                        <div className="flex gap-2">
                            <div className="h-3 w-3 rounded-full border border-black bg-[#7F100F]" />
                            <div className="h-3 w-3 rounded-full border border-black bg-[#EDF18E]" />
                            <div className="h-3 w-3 rounded-full border border-black bg-[#33915A]" />
                        </div>
                    </div>

                    {/* écran principal */}
                    <div className="flex">
                        <div className="flex-1 p-4">
                            <div className="bg-[#DEDEDE] border-4 border-black shadow-inner h-[340px] flex items-center justify-center">
                                <div className="bg-black h-[85%] w-[85%] m-4 p-3">
                                    <div
                                        className="h-full w-full rounded-2xl p-3 text-white flex flex-col gap-3"
                                        style={{ backgroundColor: mainBg }}
                                    >
                                        {/* header */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-bold">
                                                {selected ? selected.nameFr : ""}
                                            </span>
                                            <span className="text-lg opacity-70">
                                                {selected
                                                    ? `#${selected.id.toString().padStart(3, "0")}`
                                                    : ""}
                                            </span>
                                        </div>

                                        {/* images */}
                                        <div className="flex justify-around">
                                            {selected && (
                                                <>
                                                    <img
                                                        src={selected.frontImg}
                                                        alt="front"
                                                        className="h-24 w-24 image-render-pixelated"
                                                    />
                                                    <img
                                                        src={selected.backImg}
                                                        alt="back"
                                                        className="h-24 w-24 image-render-pixelated"
                                                    />
                                                </>
                                            )}
                                        </div>

                                        {/* description */}
                                        {selected && (
                                            <div className="flex flex-1 items-stretch gap-3 mt-2">
                                                <div className="flex flex-col gap-2 w-1/2">
                                                    {selected.types.map((t) => (
                                                        <span
                                                            key={t}
                                                            className="rounded-full bg-white/30 px-3 py-1 text-center text-sm"
                                                        >
                                                            {TYPE_TRANSLATIONS[t] ?? t}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex-1 bg-black/30 rounded-md text-sm flex flex-col justify-between px-3 py-2">
                                                    <p>
                                                        Poids:{" "}
                                                        <span className="font-semibold">
                                                            {selected.weightKg.toFixed(1)} kg
                                                        </span>
                                                    </p>
                                                    <p>
                                                        Taille:{" "}
                                                        <span className="font-semibold">
                                                            {selected.heightM.toFixed(1)} m
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* petite croix + boutons A/B stylisés (simple déco) */}
                            <div className="mt-4 flex items-center justify-between px-4">
                                <div className="grid grid-cols-3 grid-rows-3 gap-[2px]">
                                    <div className="h-6 w-6 bg-black col-start-2 row-start-1 rounded-t-md" />
                                    <div className="h-6 w-6 bg-black col-start-1 row-start-2 rounded-l-md" />
                                    <div className="h-6 w-6 bg-black col-start-2 row-start-2" />
                                    <div className="h-6 w-6 bg-black col-start-3 row-start-2 rounded-r-md" />
                                    <div className="h-6 w-6 bg-black col-start-2 row-start-3 rounded-b-md" />
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center shadow-inner">
                                        B
                                    </div>
                                    <div className="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center shadow-inner">
                                        A
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* charnière décorative */}
                        <div className="w-10 flex flex-col border-l-4 border-black">
                            <div className="flex-1 bg-gradient-to-r from-[#7F100F] via-[#E71D23] to-[#7F100F] border-b-4 border-black" />
                            <div className="flex-1 bg-gradient-to-r from-[#7F100F] via-[#E71D23] to-[#7F100F] border-t-4 border-black" />
                        </div>
                    </div>
                </div>

                {/* Partie droite : liste */}
                <div className="w-[260px] bg-[#E71D23] rounded-3xl border-4 border-black p-4 flex flex-col shadow-lg">
                    <div className="flex-1 bg-black shadow-inner p-2">
                        <div className="bg-[#43B0F2] rounded-2xl h-full p-2 flex flex-wrap content-start overflow-y-auto">
                            {loadingList && (
                                <p className="text-xs text-white">Chargement...</p>
                            )}
                            {!loadingList &&
                                list.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => void fetchDetails(p.id)}
                                        className="list-item basis-1/2 text-left text-xs px-1 py-1 text-white hover:bg-[#85cbf2] hover:text-black active:bg-[#1280f2] active:text-white truncate"
                                    >
                                        {p.id.toString().padStart(3, "0")}. {p.nameFr}
                                    </button>
                                ))}
                        </div>
                    </div>
                    <div className="mt-4 flex justify-between">
                        <button
                            type="button"
                            onClick={handlePrev}
                            disabled={!prevUrl}
                            className="left-button px-4 py-1 rounded-md border-2 border-black bg-[#DEDEDE] text-xs font-bold uppercase shadow disabled:opacity-40"
                        >
                            Prev
                        </button>
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={!nextUrl}
                            className="right-button px-4 py-1 rounded-md border-2 border-black bg-[#DEDEDE] text-xs font-bold uppercase shadow disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                    {loadingDetails && (
                        <p className="mt-2 text-center text-[11px] text-white/80">
                            Chargement du Pokémon...
                        </p>
                    )}
                    {error && (
                        <p className="mt-2 text-center text-[11px] text-red-200">{error}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PokedexPage;