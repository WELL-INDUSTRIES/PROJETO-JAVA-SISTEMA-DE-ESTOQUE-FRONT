import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FornecedorService } from '../../services/fornecedor.service';

@Component({
  selector: 'app-fornecedores-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fornecedores-form.html',
})
export class FornecedoresForm implements OnInit {
  @Input() dados: any;
  @Output() salvo = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  salvando = false;
  erroServidor = '';

  fornecedor: any = {
    nome: '', telefone: '', email: '',
    endereco: '', cidade: '', uf: '',
    bairro: '', observacoes: '', ativo: true,
  };

  constructor(private service: FornecedorService) {}

  ngOnInit() {
    if (this.dados) {
      this.fornecedor = {
        id: this.dados.id,
        nome: this.dados.nome ?? '',
        telefone: this.dados.telefone ?? '',
        email: this.dados.email ?? '',
        endereco: this.dados.endereco ?? '',
        cidade: this.dados.cidade ?? '',
        uf: this.dados.uf ?? '',
        bairro: this.dados.bairro ?? '',
        observacoes: this.dados.observacoes ?? '',
        ativo: this.dados.ativo ?? true,
      };
    }
  }

  formularioValido(): boolean {
    return (
      !!this.fornecedor.nome?.trim() &&
      !!this.fornecedor.telefone?.trim() &&
      !!this.fornecedor.endereco?.trim()
    );
  }

  formatarTelefone(event: Event) {
    let v = (event.target as HTMLInputElement).value.replace(/\D/g, '').substring(0, 11);
    if (v.length <= 10) {
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    } else {
      v = v.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3');
    }
    this.fornecedor.telefone = v;
  }

  salvar() {
    this.erroServidor = '';
    if (!this.formularioValido()) {
      alert('Preencha os campos obrigatórios (*).');
      return;
    }

    this.salvando = true;
    const op = this.fornecedor.id
      ? this.service.atualizar(this.fornecedor.id, this.fornecedor)
      : this.service.criar(this.fornecedor);

    op.subscribe({
      next: () => { this.salvando = false; this.salvo.emit(); },
      error: (err: any) => {
        this.salvando = false;
        this.erroServidor = err?.error?.erro ?? 'Erro ao salvar fornecedor.';
      },
    });
  }

  voltar() { this.cancelar.emit(); }
}
