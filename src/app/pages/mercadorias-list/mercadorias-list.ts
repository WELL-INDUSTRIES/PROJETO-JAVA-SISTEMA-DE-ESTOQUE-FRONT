import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MercadoriaService } from '../../services/mercadoria.service';
import {
  compareNumbers, compareValues,
  SortConfig, SortState, sortItems, toNumber, toggleSort,
} from '../../shared/table-sort';

interface MercadoriaItem {
  id?: number;
  nome?: string;
  categoria?: string;
  descricao?: string;
  quantidade?: number;
  preco?: number;
  dataCadastro?: string;
  ativo?: boolean;
  fornecedor?: { id?: number; nome?: string; telefone?: string; email?: string; endereco?: string; cidade?: string; uf?: string; };
}

type Col = 'nome' | 'categoria' | 'quantidade' | 'preco' | 'fornecedor' | 'dataCadastro' | 'status';

@Component({
  selector: 'app-mercadorias-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mercadorias-list.html',
})
export class MercadoriasList implements OnInit {
  @Output() novoCadastro = new EventEmitter<void>();
  @Output() editarCadastro = new EventEmitter<any>();

  mercadorias: MercadoriaItem[] = [];
  mercadoriasExibidas: MercadoriaItem[] = [];
  mercadoriaDetalhes: MercadoriaItem | null = null;
  carregando = true;
  mostrandoInativos = false;

  filtroBusca = '';
  filtroCategoria = '';
  filtroFornecedor = '';
  filtroStatus: 'todos' | 'estoque' | 'baixo' = 'todos';

  categorias: string[] = [];
  fornecedoresDisponiveis: string[] = [];
  itensPorPaginaOpcoes = [10, 25, 50, 100];
  itensPorPagina = 10;
  paginaAtual = 1;
  totalItensFiltrados = 0;
  quantidadesAtualizando = new Set<number>();

  private cargaAtual = 0;
  private readonly itensPorPaginaStorageKey = 'mercadoriasItensPorPagina';

  sortState: SortState<Col> = { column: 'nome', direction: 'asc' };

  private readonly sortConfig: SortConfig<MercadoriaItem, Col> = {
    nome: { accessor: m => m.nome },
    categoria: { accessor: m => m.categoria },
    quantidade: { comparator: (a, b, dir) => compareNumbers(toNumber(a.quantidade), toNumber(b.quantidade), dir) },
    preco: { comparator: (a, b, dir) => compareNumbers(toNumber(a.preco), toNumber(b.preco), dir) },
    fornecedor: { comparator: (a, b, dir) => compareValues(this.nomeFornecedor(a), this.nomeFornecedor(b), dir) },
    dataCadastro: { initialDirection: 'desc', comparator: (a, b, dir) => compareValues(a.dataCadastro || '', b.dataCadastro || '', dir) },
    status: { comparator: (a, b, dir) => compareValues(this.statusSortValue(a), this.statusSortValue(b), dir) },
  };

  constructor(private service: MercadoriaService) {}

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
        this.mercadorias = data;
        this.categorias = [...new Set(data.map((m: MercadoriaItem) => m.categoria).filter((c: any): c is string => !!c))].sort() as string[];
        this.fornecedoresDisponiveis = [...new Set(data.map((m: MercadoriaItem) => m.fornecedor?.nome).filter((n: any): n is string => !!n))].sort() as string[];
        this.totalItensFiltrados = pageData.totalElements;
        this.atualizarExibidas();
        this.carregando = false;
      },
      error: () => {
        if (cargaId !== this.cargaAtual) return;
        this.mercadorias = [];
        this.carregando = false;
        alert('Erro ao carregar mercadorias.');
      },
    });
  }

  atualizarExibidas(resetPagina = false) {
    if (resetPagina) this.paginaAtual = 1;

    const busca = this.filtroBusca.trim().toLowerCase();

    const filtrados = this.mercadorias.filter(m => {
      const matchBusca = !busca ||
        m.nome?.toLowerCase().includes(busca) ||
        m.descricao?.toLowerCase().includes(busca) ||
        this.nomeFornecedor(m).toLowerCase().includes(busca);
      const matchCat = !this.filtroCategoria || m.categoria === this.filtroCategoria;
      const matchForn = !this.filtroFornecedor || this.nomeFornecedor(m) === this.filtroFornecedor;
      const q = m.quantidade ?? 0;
      const matchStatus =
        this.filtroStatus === 'todos' ||
        (this.filtroStatus === 'estoque' && q > 5) ||
        (this.filtroStatus === 'baixo' && q >= 0 && q <= 5);

      return matchBusca && matchCat && matchForn && matchStatus;
    });

    const ordenados = sortItems(filtrados, this.sortState, this.sortConfig);
    this.ajustarPaginaAtual();

    this.mercadoriasExibidas = ordenados;
  }

  onFiltroChange() { this.atualizarExibidas(true); }

  limparFiltros() {
    this.filtroBusca = '';
    this.filtroCategoria = '';
    this.filtroFornecedor = '';
    this.filtroStatus = 'todos';
    this.atualizarExibidas(true);
  }

  get temFiltroAtivo(): boolean {
    return !!this.filtroBusca || !!this.filtroCategoria || !!this.filtroFornecedor || this.filtroStatus !== 'todos';
  }

  ordenarPor(col: Col) {
    this.sortState = toggleSort(this.sortState, col, this.sortConfig);
    this.atualizarExibidas();
  }

  sortIcon(col: Col): string {
    if (this.sortState.column !== col) return 'unfold_more';
    return this.sortState.direction === 'asc' ? 'expand_less' : 'expand_more';
  }

  trackById(_i: number, m: MercadoriaItem) { return m.id; }
  novo() { this.novoCadastro.emit(); }
  editar(m: MercadoriaItem) { this.editarCadastro.emit(m); }
  abrirDetalhes(m: MercadoriaItem) { this.mercadoriaDetalhes = m; }
  fecharDetalhes() { this.mercadoriaDetalhes = null; }

  alternarInativos() {
    this.mostrandoInativos = !this.mostrandoInativos;
    this.fecharDetalhes();
    this.limparFiltros();
    this.carregar();
  }

  excluir(id?: number, nome?: string) {
    if (!id) return;
    if (!confirm(`Deseja realmente excluir "${nome}"?`)) return;
    this.service.deletar(id).subscribe({
      next: () => { this.fecharDetalhes(); this.carregar(); },
      error: () => alert('Erro ao excluir mercadoria.'),
    });
  }

  reativar(id?: number) {
    if (!id) return;
    this.service.reativar(id).subscribe({
      next: () => { this.fecharDetalhes(); this.carregar(); },
      error: () => alert('Erro ao reativar mercadoria.'),
    });
  }

  alterarQuantidade(m: MercadoriaItem, delta: number) {
    if (!m.id || this.mostrandoInativos || this.quantidadesAtualizando.has(m.id)) return;

    const novaQuantidade = Math.max(0, (m.quantidade ?? 0) + delta);
    if (novaQuantidade === (m.quantidade ?? 0)) return;

    this.quantidadesAtualizando.add(m.id);
    this.service.atualizarQuantidade(m.id, m, novaQuantidade).subscribe({
      next: (atualizada: MercadoriaItem) => {
        m.quantidade = atualizada?.quantidade ?? novaQuantidade;
        this.atualizarExibidas();
      },
      error: () => {
        this.quantidadesAtualizando.delete(m.id!);
        alert('Erro ao atualizar quantidade.');
      },
      complete: () => this.quantidadesAtualizando.delete(m.id!),
    });
  }

  quantidadeAtualizando(m: MercadoriaItem): boolean {
    return !!m.id && this.quantidadesAtualizando.has(m.id);
  }

  alterarItensPorPagina(valor: number) {
    this.itensPorPagina = Number(valor) || 10;
    localStorage.setItem(this.itensPorPaginaStorageKey, String(this.itensPorPagina));
    this.atualizarExibidas(true);
  }

  paginaAnterior() {
    if (this.paginaAtual <= 1) return;
    this.paginaAtual--;
    this.atualizarExibidas();
  }

  proximaPagina() {
    if (this.paginaAtual >= this.totalPaginas) return;
    this.paginaAtual++;
    this.atualizarExibidas();
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.totalItensFiltrados / this.itensPorPagina));
  }

  nomeFornecedor(m: MercadoriaItem): string { return m.fornecedor?.nome ?? ''; }

  statusEstoque(m: MercadoriaItem): string {
    if (this.mostrandoInativos || m.ativo === false) return 'Inativo';
    const q = m.quantidade ?? 0;
    if (q === 0) return 'Sem estoque';
    if (q <= 5) return 'Baixo estoque';
    return 'Em estoque';
  }

  estoqueClass(m: MercadoriaItem): string {
    if (this.mostrandoInativos || m.ativo === false) return 'status-danger';
    const q = m.quantidade ?? 0;
    if (q === 0) return 'status-danger';
    if (q <= 5) return 'status-warning';
    return 'status-success';
  }

  private statusSortValue(m: MercadoriaItem): number {
    const q = m.quantidade ?? 0;
    if (q === 0) return 2;
    if (q <= 5) return 1;
    return 0;
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
