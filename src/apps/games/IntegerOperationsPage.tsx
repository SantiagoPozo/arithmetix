import { GamePracticePage } from "@/apps/games/GamePracticePage";

interface IntegerOperationsPageProps {
  locale: "es" | "en";
}

export function IntegerOperationsPage({ locale }: IntegerOperationsPageProps) {
  return (
    <GamePracticePage
      defaultRoundSeconds={45}
      gameId="integer"
      locale={locale}
    />
  );
}
