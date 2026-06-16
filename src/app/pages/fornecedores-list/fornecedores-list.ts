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

  filtroBusca = '';
  filtroCidade = '';
  filtroUF = '';

  cidades: string[] = [];
  ufs: string[] = [];

  private cargaAtual = 0;

  sortState: SortState<Col> = { column: 'nome', direction: 'asc' };

  private readonly sortConfig: SortConfig<FornecedorItem, Col> = {
    nome: { accessor: f => f.nome },
    contato: { accessor: f => f.email },
    localizacao: { comparator: (a, b, dir) => compareValues(`${a.cidade}-${a.uf}`, `${b.cidade}-${b.uf}`, dir) },
    status: { accessor: f => f.ativo ? 'Ativo' : 'Inativo' },
  };

  constructor(private service: FornecedorService) {}

  ngOnInit() { this.carregar(); }

  carregar() {
    const cargaId = ++this.cargaAtual;
    this.carregando = true;

    this.service.listar().subscribe({
      next: (data: FornecedorItem[]) => {
        if (cargaId !== this.cargaAtual) return;
        this.fornecedores = data;
        this.cidades = [...new Set(data.map(f => f.cidade).filter((c): c is string => !!c))].sort();
        this.ufs = [...new Set(data.map(f => f.uf).filter((u): u is string => !!u))].sort();
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

  atualizarExibidos() {
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

    this.fornecedoresExibidos = sortItems(filtrados, this.sortState, this.sortConfig);
  }

  onFiltroChange() { this.atualizarExibidos(); }

  limparFiltros() {
    this.filtroBusca = '';
    this.filtroCidade = '';
    this.filtroUF = '';
    this.atualizarExibidos();
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

  excluir(id?: number, nome?: string) {
    if (!id) return;
    if (!confirm(`Deseja realmente excluir o fornecedor "${nome}"?`)) return;
    this.service.deletar(id).subscribe({
      next: () => { this.fecharDetalhes(); this.carregar(); },
      error: () => alert('Erro ao excluir fornecedor.'),
    });
  }
}
