import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ReuniaoMinisterialService } from '../../../core/services/reuniao-ministerial.service';
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

  congregacoes: Congregacao[] = [];
  situacoes: SituacaoReuniaoMinisterial[] = [];

  carregandoOpcoes = false;
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
    this.carregarOpcoesDropdown();
  }

  carregarOpcoesDropdown(): void {
    this.carregandoOpcoes = true;
    this.erro = null;

    let respostasRecebidas = 0;
    const concluirCarregamento = (): void => {
      respostasRecebidas += 1;

      if (respostasRecebidas === 2) {
        this.carregandoOpcoes = false;
      }
    };

    this.service.listarCongregacoesDropdown().subscribe({
      next: congregacoes => {
        this.congregacoes = congregacoes;
        concluirCarregamento();
      },
      error: () => {
        this.erro = 'Não foi possível carregar as congregações.';
        concluirCarregamento();
      }
    });

    this.service.listarSituacoesDropdown().subscribe({
      next: situacoes => {
        this.situacoes = situacoes;
        concluirCarregamento();
      },
      error: () => {
        this.erro = 'Não foi possível carregar as situações.';
        concluirCarregamento();
      }
    });
  }

  salvar(): void {
    if (this.formulario.invalid || this.salvando) {
      this.formulario.markAllAsTouched();
      return;
    }

    const dados = this.formulario.getRawValue() as ReuniaoMinisterialRequest;

    this.salvando = true;
    this.erro = null;
    this.mensagem = null;

    this.service.criar(dados).subscribe({
      next: () => {
        this.mensagem = 'Reunião cadastrada com sucesso.';
        this.limparFormulario();
        this.salvando = false;
      },
      error: () => {
        this.erro = 'Não foi possível cadastrar a reunião.';
        this.salvando = false;
      }
    });
  }

  limparFormulario(): void {
    this.formulario.reset({
      tipoReuniao: 'PASTORES',
      congregacaoId: 0,
      dataReuniao: '',
      situacaoId: 0
    });
  }
}
