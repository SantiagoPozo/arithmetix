export type GameId = "integer" | "equations" | "order";

export interface GameRouteDefinition {
  id: GameId;
  slug: string;
  labelKey: string;
}

export const GAME_ROUTES: GameRouteDefinition[] = [
  {
    id: "integer",
    slug: "operaciones-enteros",
    labelKey: "landing:featured.integer",
  },
  {
    id: "equations",
    slug: "ecuaciones-simples",
    labelKey: "landing:featured.equations",
  },
  {
    id: "order",
    slug: "orden-operaciones",
    labelKey: "landing:featured.order",
  },
];

export function getGamePath(locale: "es" | "en", id: GameId): string {
  const gameRoute = GAME_ROUTES.find((route) => route.id === id);

  if (!gameRoute) {
    return `/${locale}`;
  }

  return `/${locale}/${gameRoute.slug}`;
}
