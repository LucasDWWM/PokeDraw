export type RoomStatus = "waiting" | "in-progress" | "full";

export interface Player {
  name: string;
}

export interface Room {
  id: string;
  name: string;
  players: Player[];
  status: RoomStatus;
  password?: string;
  pokemonId?: number;
  pokemonNameFr?: string;
  drawings?: Record<string, string>;
  currentRound?: number;
  currentPlayerIndex?: number; // 0 = premier joueur dans players[]
}
