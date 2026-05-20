import { GameGate } from "@/components/shared/GameGate";
import { GameShell } from "@/components/shared/GameShell";
import { CookingGame } from "@/components/games/cooking/CookingGame";

export default function CookingPage() {
  return (
    <GameShell title="讓他煮！" owner="陳昱銓">
      <GameGate game="cooking">
        <CookingGame />
      </GameGate>
    </GameShell>
  );
}
