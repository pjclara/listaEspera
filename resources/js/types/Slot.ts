export interface Slot {
  id: number;
  team_id: number;
  sala: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  tipo: "programado" | "ambulatorio" | "urgente";
  is_swapped: boolean;
  swapped_to_team_id: number | null;
}
