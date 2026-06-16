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

  filtroBusca = '';
  filtroCategoria = '';
  filtroFornecedor = '';
  filtroStatus: 'todos' | 'estoque' | 'baixo' = 'todos';

  categorias: string[] = [];
  fornecedoresDisponiveis: string[] = [];

  private cargaAtual = 0;

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

  ngOnInit() { this.carregar(); }

  carregar() {
    const cargaId = ++this.cargaAtual;
    this.carregando = true;

    this.service.listar().subscribe({
      next: (data: MercadoriaItem[]) => {
        if (cargaId !== this.cargaAtual) return;
        this.mercadorias = data;
        this.categorias = [...new Set(data.map(m => m.categoria).filter((c): c is string => !!c))].sort();
        this.fornecedoresDisponiveis = [...new Set(data.map(m => m.fornecedor?.nome).filter((n): n is string => !!n))].sort();
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

  atualizarExibidas() {
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

    this.mercadoriasExibidas = sortItems(filtrados, this.sortState, this.sortConfig);
  }

  onFiltroChange() { this.atualizarExibidas(); }

  limparFiltros() {
    this.filtroBusca = '';
    this.filtroCategoria = '';
    this.filtroFornecedor = '';
    this.filtroStatus = 'todos';
    this.atualizarExibidas();
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

  excluir(id?: number, nome?: string) {
    if (!id) return;
    if (!confirm(`Deseja realmente excluir "${nome}"?`)) return;
    this.service.deletar(id).subscribe({
      next: () => { this.fecharDetalhes(); this.carregar(); },
      error: () => alert('Erro ao excluir mercadoria.'),
    });
  }

  nomeFornecedor(m: MercadoriaItem): string { return m.fornecedor?.nome ?? ''; }

  statusEstoque(m: MercadoriaItem): string {
    const q = m.quantidade ?? 0;
    if (q === 0) return 'Sem estoque';
    if (q <= 5) return 'Baixo estoque';
    return 'Em estoque';
  }

  estoqueClass(m: MercadoriaItem): string {
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
}
