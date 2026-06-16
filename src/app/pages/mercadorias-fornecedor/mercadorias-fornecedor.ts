import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FornecedorService } from '../../services/fornecedor.service';

export interface Fornecedor {
  id?: number;
  nome?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  bairro?: string;
}

export interface MercadoriaItem {
  id?: number;
  nome?: string;
  descricao?: string;
  categoria?: string;
  preco?: number;
  quantidade?: number;
  dataCadastro?: string;
  fornecedor?: Fornecedor;
}

@Component({
  selector: 'app-mercadorias-fornecedor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mercadorias-fornecedor.html',
})
export class MercadoriasFornecedor implements OnInit {
  @Input() fornecedor!: Fornecedor;
  @Output() voltar = new EventEmitter<void>();

  mercadorias: MercadoriaItem[] = [];
  carregando = true;
  erro = '';

  constructor(private fornecedorService: FornecedorService) {}

  ngOnInit() {
    if (this.fornecedor?.id == null) return;

    this.fornecedorService.listarMercadoriasDoFornecedor(this.fornecedor.id).subscribe({
      next: data => {
        this.mercadorias = data;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Erro ao carregar mercadorias do fornecedor.';
        this.carregando = false;
      },
    });
  }

  enderecoCompleto(): string {
    return [
      this.fornecedor?.endereco,
      this.fornecedor?.bairro,
      this.fornecedor?.cidade,
      this.fornecedor?.uf,
    ]
      .filter(Boolean)
      .join(', ');
  }

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
}
