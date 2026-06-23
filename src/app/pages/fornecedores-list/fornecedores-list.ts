import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FornecedorService } from '../../services/fornecedor.service';
import {
  compareValues,
  SortConfig, SortState, sortItems, toggleSort,
} from '../../shared/table-sort';

interface FornecedorItem {
  id?: number;
  nome?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  ativo?: boolean;
}

type Col = 'nome' | 'contato' | 'localizacao' | 'status';

@Component({
  selector: 'app-fornecedores-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fornecedores-list.html',
})
export class FornecedoresList implements OnInit {
  @Output() novoCadastro = new EventEmitter<void>();
  @Output() editarCadastro = new EventEmitter<any>();
  @Output() verMercadorias = new EventEmitter<any>();

  fornecedores: FornecedorItem[] = [];
  fornecedoresExibidos: FornecedorItem[] = [];
  fornecedorDetalhes: FornecedorItem | null = null;
  carregando = true;
  mostrandoInativos = false;

  filtroBusca = '';
  filtroCidade = '';
  filtroUF = '';

  cidades: string[] = [];
  ufs: string[] = [];
  itensPorPaginaOpcoes = [10, 25, 50, 100];
  itensPorPagina = 10;
  paginaAtual = 1;
  totalItensFiltrados = 0;

  private cargaAtual = 0;
  private readonly itensPorPaginaStorageKey = 'fornecedoresItensPorPagina';

  sortState: SortState<Col> = { column: 'nome', direction: 'asc' };

  private readonly sortConfig: SortConfig<FornecedorItem, Col> = {
    nome: { accessor: f => f.nome },
    contato: { accessor: f => f.email },
    localizacao: { comparator: (a, b, dir) => compareValues(`${a.cidade}-${a.uf}`, `${b.cidade}-${b.uf}`, dir) },
    status: { accessor: f => f.ativo ? 'Ativo' : 'Inativo' },
  };

  constructor(private service: FornecedorService) {}

  ngOnInit() {
    this.itensPorPagina = this.carregarItensPorPagina();
    this.carregar();
  }

  carregar() {
    const cargaId = ++this.cargaAtual;
    this.carregando = true;

    const request = this.mostrandoInativos
      ? this.service.listarInativos(this.paginaAtual - 1, this.itensPorPagina)
      : this.service.listar(this.paginaAtual - 1, this.itensPorPagina);

    request.subscribe({
      next: (pageData: any) => {
        const data = pageData.content;
        if (cargaId !== this.cargaAtual) return;
        this.fornecedores = data;
        this.totalItensFiltrados = pageData.totalElements;
        this.cidades = [...new Set(pageData.content.map((f: FornecedorItem) => f.cidade).filter((c: any): c is string => !!c))].sort() as string[];
        this.ufs = [...new Set(pageData.content.map((f: FornecedorItem) => f.uf).filter((u: any): u is string => !!u))].sort() as string[];
        this.atualizarExibidos();
        this.carregando = false;
      },
      error: () => {
        if (cargaId !== this.cargaAtual) return;
        this.fornecedores = [];
        this.carregando = false;
        alert('Erro ao carregar fornecedores.');
      },
    });
  }

  atualizarExibidos(resetPagina = false) {
    if (resetPagina) this.paginaAtual = 1;

    const busca = this.filtroBusca.trim().toLowerCase();

    const filtrados = this.fornecedores.filter(f => {
      const matchBusca = !busca ||
        f.nome?.toLowerCase().includes(busca) ||
        f.email?.toLowerCase().includes(busca) ||
        f.cidade?.toLowerCase().includes(busca);
      const matchCidade = !this.filtroCidade || f.cidade === this.filtroCidade;
      const matchUF = !this.filtroUF || f.uf === this.filtroUF;

      return matchBusca && matchCidade && matchUF;
    });

    const ordenados = sortItems(filtrados, this.sortState, this.sortConfig);
    this.ajustarPaginaAtual();

    // A paginação já é feita pelo backend, então 'fornecedores' já contém apenas os itens da página atual.
    // Aplicamos apenas a ordenação e filtros locais (busca, cidade, UF) sobre essa página.
    this.fornecedoresExibidos = ordenados;
  }

  onFiltroChange() { this.atualizarExibidos(true); }

  limparFiltros() {
    this.filtroBusca = '';
    this.filtroCidade = '';
    this.filtroUF = '';
    this.atualizarExibidos(true);
  }

  get temFiltroAtivo(): boolean {
    return !!this.filtroBusca || !!this.filtroCidade || !!this.filtroUF;
  }

  ordenarPor(col: Col) {
    this.sortState = toggleSort(this.sortState, col, this.sortConfig);
    this.atualizarExibidos();
  }

  sortIcon(col: Col): string {
    if (this.sortState.column !== col) return 'unfold_more';
    return this.sortState.direction === 'asc' ? 'expand_less' : 'expand_more';
  }

  trackById(_i: number, f: FornecedorItem) { return f.id; }
  novo() { this.novoCadastro.emit(); }
  editar(f: FornecedorItem) { this.editarCadastro.emit(f); }
  verProdutos(f: FornecedorItem) { this.verMercadorias.emit(f); }
  abrirDetalhes(f: FornecedorItem) { this.fornecedorDetalhes = f; }
  fecharDetalhes() { this.fornecedorDetalhes = null; }

  alternarInativos() {
    this.mostrandoInativos = !this.mostrandoInativos;
    this.fecharDetalhes();
    this.limparFiltros();
    this.carregar();
  }

  excluir(id?: number, nome?: string) {
    if (!id) return;
    if (!confirm(`Deseja realmente excluir o fornecedor "${nome}"?`)) return;
    this.service.deletar(id).subscribe({
      next: () => { this.fecharDetalhes(); this.carregar(); },
      error: () => alert('Erro ao excluir fornecedor.'),
    });
  }

  reativar(id?: number) {
    if (!id) return;
    this.service.reativar(id).subscribe({
      next: () => { this.fecharDetalhes(); this.carregar(); },
      error: () => alert('Erro ao reativar fornecedor.'),
    });
  }

  alterarItensPorPagina(valor: number) {
    this.itensPorPagina = Number(valor) || 10;
    localStorage.setItem(this.itensPorPaginaStorageKey, String(this.itensPorPagina));
    this.atualizarExibidos(true);
  }

  paginaAnterior() {
    if (this.paginaAtual <= 1) return;
    this.paginaAtual--;
    this.atualizarExibidos();
  }

  proximaPagina() {
    if (this.paginaAtual >= this.totalPaginas) return;
    this.paginaAtual++;
    this.atualizarExibidos();
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.totalItensFiltrados / this.itensPorPagina));
  }

  private carregarItensPorPagina(): number {
    const salvo = Number(localStorage.getItem(this.itensPorPaginaStorageKey));
    return this.itensPorPaginaOpcoes.includes(salvo) ? salvo : 10;
  }

  private ajustarPaginaAtual() {
    if (this.paginaAtual > this.totalPaginas) this.paginaAtual = this.totalPaginas;
    if (this.paginaAtual < 1) this.paginaAtual = 1;
  }
}
