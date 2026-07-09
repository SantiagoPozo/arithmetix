import { GamePracticePage } from "@/apps/games/GamePracticePage";

interface OrderOperationsPageProps {
  locale: "es" | "en";
}

export function OrderOperationsPage({ locale }: OrderOperationsPageProps) {
  return (
    <GamePracticePage defaultRoundSeconds={75} gameId="order" locale={locale} />
  );
}
