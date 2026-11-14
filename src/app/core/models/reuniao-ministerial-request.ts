import { ReuniaoMinisterial } from './reuniao-ministerial'

export type ReuniaoMinisterialRequest = Omit<
  ReuniaoMinisterial,
  'reuniaoMinisterialId'
>;