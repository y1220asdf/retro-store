import { GameGate } from "@/components/shared/GameGate";
import { GameShell } from "@/components/shared/GameShell";
import { CandyJarGame } from "@/components/games/candy-jar/CandyJarGame";

export default function CandyJarPage() {
  return (
    <GameShell title="玻璃糖果罐" owner="黃品恩">
      <GameGate game="candy-jar">
        <CandyJarGame />
      </GameGate>
    </GameShell>
  );
}
