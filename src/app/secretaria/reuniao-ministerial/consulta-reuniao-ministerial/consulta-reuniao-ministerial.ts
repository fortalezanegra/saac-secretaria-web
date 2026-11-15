import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ReuniaoMinisterialService } from '../../../core/services/reuniao-ministerial.service';
import { ReuniaoMinisterial } from '../../../core/models/reuniao-ministerial';
import { ReuniaoMinisterialRequest } from '../../../core/models/reuniao-ministerial-request';
import { Congregacao } from '../../../core/models/congregacao';
import { SituacaoReuniaoMinisterial } from '../../../core/models/situacao-reuniao-ministerial';
import { TipoReuniao } from '../../../core/models/tipo-reuniao';

@Component({
  selector: 'app-consulta-reuniao-ministerial',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './consulta-reuniao-ministerial.html',
  styleUrl: './consulta-reuniao-ministerial.scss'
})
export class ConsultaReuniaoMinisterial implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ReuniaoMinisterialService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly tiposReuniao: { valor: TipoReuniao; descricao: string }[] = [
    { valor: 'PASTORES', descricao: 'Pastores' },
    { valor: 'DIRIGENTES', descricao: 'Dirigentes' },
    { valor: 'OBREIROS', descricao: 'Obreiros' },
    { valor: 'EXTRAORDINARIA', descricao: 'Extraordinária' }
  ];

  reunioes: ReuniaoMinisterial[] = [];
  congregacoes: Congregacao[] = [];
  situacoes: SituacaoReuniaoMinisterial[] = [];

  termoPesquisa = '';
  paginaAtual = 1;
  itensPorPagina = 10;

  reuniaoEmEdicao: number | null = null;
  carregando = false;
  salvando = false;
  excluindoId: number | null = null;
  erro: string | null = null;
  mensagem: string | null = null;

  readonly formulario = this.fb.nonNullable.group({
    tipoReuniao: ['PASTORES' as TipoReuniao, Validators.required],
    congregacaoId: [0, [Validators.required, Validators.min(1)]],
    dataReuniao: ['', Validators.required],
    situacaoId: [0, [Validators.required, Validators.min(1)]]
  });

  get reunioesFiltradas(): ReuniaoMinisterial[] {
    const termo = this.termoPesquisa.trim().toLocaleLowerCase('pt-BR');

    if (!termo) {
      return this.reunioes;
    }

    return this.reunioes.filter(reuniao => {
      const textoPesquisa = [
        reuniao.reuniaoMinisterialId,
        this.descricaoTipo(reuniao.tipoReuniao),
        reuniao.congregacao ?? this.nomeCongregacao(reuniao.congregacaoId),
        reuniao.situacao ?? this.descricaoSituacao(reuniao.situacaoId),
        reuniao.dataReuniao
      ].join(' ').toLocaleLowerCase('pt-BR');

      return textoPesquisa.includes(termo);
    });
  }

  get totalPaginas(): number {
    return Math.max(
      1,
      Math.ceil(this.reunioesFiltradas.length / this.itensPorPagina)
    );
  }

  get reunioesDaPagina(): ReuniaoMinisterial[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.reunioesFiltradas.slice(inicio, inicio + this.itensPorPagina);
  }

  get primeiroItemExibido(): number {
    return this.reunioesFiltradas.length === 0
      ? 0
      : (this.paginaAtual - 1) * this.itensPorPagina + 1;
  }

  get ultimoItemExibido(): number {
    return Math.min(
      this.paginaAtual * this.itensPorPagina,
      this.reunioesFiltradas.length
    );
  }

  ngOnInit(): void {
    this.carregarReunioes();
    this.carregarCongregacoes();
    this.carregarSituacoes();
  }

  carregarReunioes(): void {
    this.carregando = true;
    this.erro = null;

    this.service.listar().subscribe({
      next: reunioes => {
        this.reunioes = [...reunioes];
        this.paginaAtual = Math.min(this.paginaAtual, this.totalPaginas);
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.erro = 'Não foi possível carregar as reuniões ministeriais.';
        this.carregando = false;
        this.cdr.markForCheck();
      }
    });
  }

  private carregarCongregacoes(): void {
    this.service.listarCongregacoesDropdown().subscribe({
      next: congregacoes => {
        this.congregacoes = congregacoes;
      },
      error: () => {
        this.erro = 'Não foi possível carregar as congregações.';
      }
    });
  }

  private carregarSituacoes(): void {
    this.service.listarSituacoesDropdown().subscribe({
      next: situacoes => {
        this.situacoes = situacoes;
      },
      error: () => {
        this.erro = 'Não foi possível carregar as situações.';
      }
    });
  }

  aoAlterarPesquisa(): void {
    this.paginaAtual = 1;
  }

  alterarItensPorPagina(valor: number | string): void {
    const quantidade = Number(valor);

    if ([10, 25, 50].includes(quantidade)) {
      this.itensPorPagina = quantidade;
      this.paginaAtual = 1;
    }
  }

  paginaAnterior(): void {
    if (this.paginaAtual > 1) {
      this.paginaAtual -= 1;
    }
  }

  proximaPagina(): void {
    if (this.paginaAtual < this.totalPaginas) {
      this.paginaAtual += 1;
    }
  }

  editar(reuniao: ReuniaoMinisterial): void {
    this.reuniaoEmEdicao = reuniao.reuniaoMinisterialId;

    this.formulario.setValue({
      tipoReuniao: reuniao.tipoReuniao,
      congregacaoId: reuniao.congregacaoId,
      dataReuniao: reuniao.dataReuniao.slice(0, 10),
      situacaoId: reuniao.situacaoId
    });

    this.erro = null;
    this.mensagem = null;
  }

  salvarAlteracoes(): void {
    if (this.formulario.invalid || this.salvando || this.reuniaoEmEdicao === null) {
      this.formulario.markAllAsTouched();
      return;
    }

    const dados = this.formulario.getRawValue() as ReuniaoMinisterialRequest;
    const id = this.reuniaoEmEdicao;

    this.salvando = true;
    this.erro = null;
    this.mensagem = null;

    this.service.atualizar(id, dados).subscribe({
      next: () => {
        this.mensagem = 'Reunião atualizada com sucesso.';
        this.limparFormulario();
        this.carregarReunioes();
        this.salvando = false;
      },
      error: () => {
        this.erro = 'Não foi possível atualizar a reunião.';
        this.salvando = false;
      }
    });
  }

  excluir(reuniao: ReuniaoMinisterial): void {
    const confirmado = window.confirm(
      `Deseja excluir a reunião ${reuniao.reuniaoMinisterialId}?`
    );

    if (!confirmado) {
      return;
    }

    this.erro = null;
    this.mensagem = null;
    this.excluindoId = reuniao.reuniaoMinisterialId;
this.cdr.markForCheck();

this.service.excluir(reuniao.reuniaoMinisterialId).subscribe({
  next: () => {
    this.mensagem = 'Reunião excluída com sucesso.';

    if (this.reuniaoEmEdicao === reuniao.reuniaoMinisterialId) {
      this.limparFormulario();
    }

    this.excluindoId = null;
    this.cdr.markForCheck();
    this.carregarReunioes();
  },
  error: () => {
    this.erro = 'Não foi possível excluir a reunião.';
    this.excluindoId = null;
    this.cdr.markForCheck();
  }
});
  }

  limparFormulario(): void {
    this.reuniaoEmEdicao = null;
    this.formulario.reset({
      tipoReuniao: 'PASTORES',
      congregacaoId: 0,
      dataReuniao: '',
      situacaoId: 0
    });
  }

  nomeCongregacao(id: number): string {
    return this.congregacoes.find(item => item.congregacaoId === id)?.nome
      ?? `ID ${id}`;
  }

  descricaoSituacao(id: number): string {
    return this.situacoes.find(item => item.situacaoId === id)?.descricao
      ?? `ID ${id}`;
  }

  descricaoTipo(tipo: TipoReuniao): string {
    return this.tiposReuniao.find(item => item.valor === tipo)?.descricao ?? tipo;
  }
}
