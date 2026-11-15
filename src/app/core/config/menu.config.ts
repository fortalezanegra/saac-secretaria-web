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
        label: 'Cadastrar reunião ministerial',
        icon: 'add_circle',
        rota: '/secretaria/reunioes-ministeriais/cadastro'
      },
      {
        label: 'Consultar reuniões ministeriais',
        icon: 'search',
        rota: '/secretaria/reunioes-ministeriais/consulta'
      }
    ]
  }
];
