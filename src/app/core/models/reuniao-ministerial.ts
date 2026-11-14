import { TipoReuniao } from "./tipo-reuniao";

export interface ReuniaoMinisterial {
  reuniaoMinisterialId: number;
  tipoReuniao: TipoReuniao;
  congregacaoId: number;
  dataReuniao: string;
  situacaoId: number;
}

