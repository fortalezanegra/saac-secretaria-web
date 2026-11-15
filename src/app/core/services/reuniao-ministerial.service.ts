import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ReuniaoMinisterial } from '../models/reuniao-ministerial';
import { ReuniaoMinisterialRequest } from '../models/reuniao-ministerial-request';
import { Congregacao } from '../models/congregacao';
import { SituacaoReuniaoMinisterial } from '../models/situacao-reuniao-ministerial';

@Injectable({ providedIn: 'root' })
export class ReuniaoMinisterialService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl =
    `${environment.apis.secretaria}/reuniao-ministerial`;

  private readonly congregacaoDropdownUrl =
    `${environment.apis.secretaria}/congregacao/dropdown`;

  private readonly situacaoDropdownUrl =
    `${this.baseUrl}/dropdown/situacao`;

  listarCongregacoesDropdown(): Observable<Congregacao[]> {
    return this.http.get<Congregacao[]>(this.congregacaoDropdownUrl);
  }

  listarSituacoesDropdown(): Observable<SituacaoReuniaoMinisterial[]> {
    return this.http.get<SituacaoReuniaoMinisterial[]>(this.situacaoDropdownUrl);
  }

  listar(): Observable<ReuniaoMinisterial[]> {
    return this.http.get<ReuniaoMinisterial[]>(this.baseUrl);
  }

  criar(dados: ReuniaoMinisterialRequest): Observable<ReuniaoMinisterial> {
    return this.http.post<ReuniaoMinisterial>(this.baseUrl, dados);
  }

  atualizar(
    id: number,
    dados: ReuniaoMinisterialRequest
  ): Observable<ReuniaoMinisterial> {
    return this.http.put<ReuniaoMinisterial>(
      this.baseUrl,
      { ...dados, reuniaoMinisterialId: id }
    );
  }

  excluir(id: number): Observable<void> {
  return this.http.put<void>(`${this.baseUrl}/delete`, {
    reuniaoMinisterialId: id
  });
}




}
