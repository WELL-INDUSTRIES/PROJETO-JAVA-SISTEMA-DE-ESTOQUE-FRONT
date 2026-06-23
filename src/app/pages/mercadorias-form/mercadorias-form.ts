import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MercadoriaService } from '../../services/mercadoria.service';
import { FornecedorService } from '../../services/fornecedor.service';

export const CATEGORIAS_PC = [
  'Placa-mãe',
  'Processador',
  'Memória RAM',
  'Armazenamento (SSD/HDD)',
  'Placa de Vídeo',
  'Fonte de Alimentação',
  'Gabinete',
  'Cooler / Refrigeração',
  'Monitor',
  'Teclado',
  'Mouse',
  'Headset / Fone',
  'Webcam',
  'Roteador / Switch / Rede',
  'Cabo / Adaptador',
  'Periférico Geral',
  'Outros',
] as const;

@Component({
  selector: 'app-mercadorias-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mercadorias-form.html',
})
export class MercadoriasForm implements OnInit {
  @Input() dados: any;
  @Output() salvo = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  readonly categorias = CATEGORIAS_PC;

  salvando = false;
  erroServidor = '';

  mercadoria: any = {
    nome: '',
    descricao: '',
    categoria: '',
    quantidade: 0,
    preco: 0,
    fornecedorId: null,
  };

  fornecedores: any[] = [];

  constructor(
    private service: MercadoriaService,
    private fornecedorService: FornecedorService,
  ) {}

  ngOnInit() {
    if (this.dados) {
      this.mercadoria = {
        id: this.dados.id,
        nome: this.dados.nome ?? '',
        descricao: this.dados.descricao ?? '',
        categoria: this.dados.categoria ?? '',
        quantidade: this.dados.quantidade ?? 0,
        preco: this.dados.preco ?? 0,
        fornecedorId: this.dados.fornecedor?.id ?? this.dados.fornecedorId ?? null,
      };
    }

    // No formulário, listamos todos os fornecedores ativos para seleção, sem paginação específica
    // Usamos page 0 e um size grande para buscar todos.
    this.fornecedorService.listar(0, 1000).subscribe({
      next: (pageData: any) => {
        // Como o serviço agora retorna um objeto Page, precisamos pegar o .content
        const data = pageData.content || [];
        this.fornecedores = data.filter((f: any) => f.ativo !== false);
      },
      error: () => alert('Erro ao carregar fornecedores.'),
    });
  }

  formularioValido(): boolean {
    return (
      !!this.mercadoria.nome?.trim() &&
      this.mercadoria.quantidade !== null &&
      this.mercadoria.quantidade >= 0 &&
      !!this.mercadoria.preco &&
      !!this.mercadoria.fornecedorId
    );
  }

  salvar() {
    this.erroServidor = '';
    if (!this.formularioValido()) {
      alert('Preencha todos os campos obrigatórios (*).');
      return;
    }

    this.salvando = true;
    const payload = { ...this.mercadoria };
    const op = this.mercadoria.id
      ? this.service.atualizar(this.mercadoria.id, payload)
      : this.service.criar(payload);

    op.subscribe({
      next: () => { this.salvando = false; this.salvo.emit(); },
      error: (err: any) => {
        this.salvando = false;
        this.erroServidor = err?.error?.erro ?? 'Erro ao salvar mercadoria.';
      },
    });
  }

  voltar() { this.cancelar.emit(); }
}
