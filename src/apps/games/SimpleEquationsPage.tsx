import { GamePracticePage } from "@/apps/games/GamePracticePage";

interface SimpleEquationsPageProps {
  locale: "es" | "en";
}

export function SimpleEquationsPage({ locale }: SimpleEquationsPageProps) {
  return (
    <GamePracticePage
      defaultRoundSeconds={60}
      gameId="equations"
      locale={locale}
    />
  );
}
