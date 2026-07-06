export interface WaitingList {
  id: number;
  data_inscricao: string | null;
  prioridade: number | null;
  origem: string | null;
  estado: string | null;
  sexo: string | null;
  episodio_id: number | null;
  instituicao: string | null;
  medico_id: number | null;
  medico_nome: string | null;
  diagnostico_cid: string | null;
  diagnostico_desc: string | null;
  procedimento_pcs: string | null;
  data_prevista: string | null;
  duracao_estimada: number | null;
  motivo_cancelamento: string | null;
}
