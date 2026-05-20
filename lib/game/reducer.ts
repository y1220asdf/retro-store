import type { GameAction, GameState } from "./types";

export const initialGameState: GameState = {
  inventory: ["sticky-note"],
  completed: {
    lottery: false,
    "candy-jar": false,
    "calendar-puzzle": false,
    weighing: false,
    cooking: false,
  },
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "ADD_ITEM":
      if (state.inventory.includes(action.item)) return state;
      return { ...state, inventory: [...state.inventory, action.item] };
    case "COMPLETE_GAME":
      if (state.completed[action.game]) return state;
      return {
        ...state,
        completed: { ...state.completed, [action.game]: true },
      };
    case "RESET":
      return initialGameState;
    default:
      return state;
  }
}
