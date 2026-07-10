export interface Schedule {
  id: number;
  slot_id: number;
  waiting_list_id: number;
  user_id: number;
  estado: "proposto" | "agendado" | "realizado" | "cancelado";
  duracao_estimada: number | null;
}
