import { GameGate } from "@/components/shared/GameGate";
import { GameShell } from "@/components/shared/GameShell";
import { WeighingGame } from "@/components/games/weighing/WeighingGame";

export default function WeighingPage() {
  return (
    <GameShell title="秤重" owner="洪秀蓮">
      <GameGate game="weighing">
        <WeighingGame />
      </GameGate>
    </GameShell>
  );
}
