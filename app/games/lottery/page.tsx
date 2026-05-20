import { GameShell } from "@/components/shared/GameShell";
import { LotteryGame } from "@/components/games/lottery/LotteryGame";

export default function LotteryPage() {
  return (
    <GameShell title="抽抽樂" owner="林芮竫">
      <LotteryGame />
    </GameShell>
  );
}
