import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ReuniaoMinisterialService } from '../../../core/services/reuniao-ministerial.service';
import {ReuniaoMinisterial } from '../../../core/models/reuniao-ministerial';
import { ReuniaoMinisterialRequest } from '../../../core/models/reuniao-ministerial-request';
import { TipoReuniao } from '../../../core/models/tipo-reuniao';
import { SituacaoReuniaoMinisterial } from '../../../core/models/situacao-reuniao-ministerial';
import { Congregacao } from '../../../core/models/congregacao';

@Component({
  selector: 'app-cadastro-reuniao-ministerial',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cadastro-reuniao-ministerial.html',
  styleUrl: './cadastro-reuniao-ministerial.scss'
})
export class CadastroReuniaoMinisterial implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ReuniaoMinisterialService);

  readonly tiposReuniao: { valor: TipoReuniao; descricao: string }[] = [
    { valor: 'PASTORES', descricao: 'Pastores' },
    { valor: 'DIRIGENTES', descricao: 'Dirigentes' },
    { valor: 'OBREIROS', descricao: 'Obreiros' },
    { valor: 'EXTRAORDINARIA', descricao: 'Extraordinária' }
  ];

  reunioes: ReuniaoMinisterial[] = [];
  congregacoes: Congregacao[] = [];
  situacoes: SituacaoReuniaoMinisterial[] = [];
  reuniaoEmEdicao: number | null = null;
  carregando = false;
  salvando = false;
  erro: string | null = null;
  mensagem: string | null = null;

  readonly formulario = this.fb.nonNullable.group({
    tipoReuniao: ['PASTORES' as TipoReuniao, Validators.required],
    congregacaoId: [0, [Validators.required, Validators.min(1)]],
    dataReuniao: ['', Validators.required],
    situacaoId: [0, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.carregarReunioes();
    this.carregarOpcoesDropdown();
  }

  carregarOpcoesDropdown(): void {
    this.service.listarCongregacoesDropdown().subscribe({
      next: congregacoes => {
        this.congregacoes = congregacoes;
      },
      error: () => {
        this.erro = 'Não foi possível carregar as congregações.';
      }
    });

    this.service.listarSituacoesDropdown().subscribe({
      next: situacoes => {
        this.situacoes = situacoes;
      },
      error: () => {
        this.erro = 'Não foi possível carregar as situações.';
      }
    });
  }

  carregarReunioes(): void {
    this.carregando = true;
    this.erro = null;

    this.service.listar().subscribe({
      next: reunioes => {
        this.reunioes = reunioes;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar as reuniões ministeriais.';
        this.carregando = false;
      }
    });
  }

  salvar(): void {
    if (this.formulario.invalid || this.salvando) {
      this.formulario.markAllAsTouched();
      return;
    }

    const dados = this.formulario.getRawValue() as ReuniaoMinisterialRequest;
    const id = this.reuniaoEmEdicao;

    this.salvando = true;
    this.erro = null;
    this.mensagem = null;

    const operacao = id === null
      ? this.service.criar(dados)
      : this.service.atualizar(id, dados);

    operacao.subscribe({
      next: () => {
        this.mensagem = id === null
          ? 'Reunião cadastrada com sucesso.'
          : 'Reunião atualizada com sucesso.';
        this.limparFormulario();
        this.carregarReunioes();
        this.salvando = false;
      },
      error: () => {
        this.erro = 'Não foi possível salvar a reunião.';
        this.salvando = false;
      }
    });
  }

  editar(reuniao: ReuniaoMinisterial): void {
    this.reuniaoEmEdicao = reuniao.reuniaoMinisterialId;
    this.formulario.setValue({
      tipoReuniao: reuniao.tipoReuniao,
      congregacaoId: reuniao.congregacaoId,
      dataReuniao: reuniao.dataReuniao.slice(0, 10),
      situacaoId: reuniao.situacaoId
    });

    this.mensagem = null;
    this.erro = null;
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

    this.service.excluir(reuniao.reuniaoMinisterialId).subscribe({
      next: () => {
        this.mensagem = 'Reunião excluída com sucesso.';

        if (this.reuniaoEmEdicao === reuniao.reuniaoMinisterialId) {
          this.limparFormulario();
        }

        this.carregarReunioes();
      },
      error: () => {
        this.erro = 'Não foi possível excluir a reunião.';
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

  descricaoTipo(tipo: TipoReuniao): string {
    return this.tiposReuniao.find(item => item.valor === tipo)?.descricao ?? tipo;
  }
}