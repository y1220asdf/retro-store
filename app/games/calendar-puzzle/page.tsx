import { GameShell } from "@/components/shared/GameShell";
import { CalendarPuzzleGame } from "@/components/games/calendar-puzzle/CalendarPuzzleGame";

export default function CalendarPuzzlePage() {
  return (
    <GameShell title="日曆拼圖" owner="盧家愛">
      <CalendarPuzzleGame />
    </GameShell>
  );
}
