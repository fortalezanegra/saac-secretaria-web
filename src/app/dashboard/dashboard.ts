import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';



// Imports do Sistema
import { AuthService } from '../core/services/auth.service';

interface ModuloSecretaria {
  nome: string;
  descricao: string;
  icone: string;
  permissao: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  private readonly authService = inject(AuthService);

  readonly usuario = this.authService.usuarioLogadoSignal;

  readonly modulos: ModuloSecretaria[] = [
    {
      nome: 'Reuniões ministeriais',
      descricao: 'Cadastro e consulta de reuniões ministeriais.',
      icone: 'groups',
      permissao: 'PERMISSION_SECRETARIA_REUNIAO_MINISTERIAL_READ'
    },
    {
      nome: 'Membros',
      descricao: 'Consulta e administração de pessoas e membros.',
      icone: 'people',
      permissao: 'PERMISSION_SECRETARIA_MEMBRO_READ'
    },
    {
      nome: 'Eventos e atividades',
      descricao: 'Acompanhamento de eventos e atividades.',
      icone: 'event',
      permissao: 'PERMISSION_SECRETARIA_EVENTO_READ'
    },
    {
      nome: 'Ocorrências',
      descricao: 'Consulta e administração de ocorrências.',
      icone: 'assignment',
      permissao: 'PERMISSION_SECRETARIA_OCORRENCIA_READ'
    }
  ];

  readonly modulosDisponiveis = computed(() => {
    const usuario = this.usuario();

    if (!usuario) {
      return [];
    }

    return this.modulos.filter(modulo =>
      this.authService.temPermissao(modulo.permissao)
    );
  });

  logout(): void {
    this.authService.logout();
  }
}
