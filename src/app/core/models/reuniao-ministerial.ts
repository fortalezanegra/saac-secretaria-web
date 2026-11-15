import { TipoReuniao } from "./tipo-reuniao";

export interface ReuniaoMinisterial {
  reuniaoMinisterialId: number;
  tipoReuniao: TipoReuniao;
  congregacaoId: number;
  congregacao?: string;
  dataReuniao: string;
  situacaoId: number;
  situacao?: string
}

