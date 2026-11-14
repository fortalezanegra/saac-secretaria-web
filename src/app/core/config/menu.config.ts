export interface MenuItem {
  label: string;
  icon: string;
  rota?: string;
  permissao?: string;
  filhos?: MenuItem[];
}

export const MENU_ITEMS: MenuItem[] = [

  {
    label: 'Secretaria',
    icon: 'event_note',
    filhos: [
      {
        label: 'Cadastro de Reunião Ministerial',
        icon: 'event',
        rota: '/secretaria/reunioes-ministeriais/cadastro'
      }
    ]
  }
];
