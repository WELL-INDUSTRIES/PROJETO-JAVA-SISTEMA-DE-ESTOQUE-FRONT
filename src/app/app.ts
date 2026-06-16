import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Login } from './pages/login/login';
import { FornecedoresList } from './pages/fornecedores-list/fornecedores-list';
import { MercadoriasList } from './pages/mercadorias-list/mercadorias-list';
import { MercadoriasForm } from './pages/mercadorias-form/mercadorias-form';
import { FornecedoresForm } from './pages/fornecedores-form/fornecedores-form';
import { MercadoriasFornecedor } from './pages/mercadorias-fornecedor/mercadorias-fornecedor';

type Tela = 'login' | 'sistema';
type Aba =
  | ''
  | 'mercadoria'
  | 'mercadoria-form'
  | 'fornecedor'
  | 'fornecedor-form'
  | 'mercadorias-fornecedor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    Login,
    FornecedoresList,
    MercadoriasList,
    MercadoriasForm,
    FornecedoresForm,
    MercadoriasFornecedor,
  ],
  templateUrl: './app.html',
})
export class App {
  tela: Tela = 'login';
  aba: Aba = '';
  menuAberto = false;

  mercadoriaSelecionada: any = null;
  fornecedorSelecionado: any = null;
  fornecedorParaMercadorias: any = null;

  onAutenticado() {
    this.tela = 'sistema';
    this.aba = '';
  }

  sair() {
    sessionStorage.removeItem('autenticado');
    this.tela = 'login';
    this.aba = '';
    this.menuAberto = false;
  }

  irParaMercadorias() {
    this.aba = 'mercadoria';
    this.menuAberto = false;
  }

  irParaFornecedores() {
    this.aba = 'fornecedor';
    this.menuAberto = false;
  }

  novaMercadoria() {
    this.mercadoriaSelecionada = null;
    this.aba = 'mercadoria-form';
    this.menuAberto = false;
  }

  novoFornecedor() {
    this.fornecedorSelecionado = null;
    this.aba = 'fornecedor-form';
    this.menuAberto = false;
  }

  onMercadoriaSalva() {
    this.aba = 'mercadoria';
    this.mercadoriaSelecionada = null;
  }

  onFornecedorSalvo() {
    this.aba = 'fornecedor';
    this.fornecedorSelecionado = null;
  }

  onCancelarMercadoria() {
    this.aba = 'mercadoria';
    this.mercadoriaSelecionada = null;
  }

  onCancelarFornecedor() {
    this.aba = 'fornecedor';
    this.fornecedorSelecionado = null;
  }

  onVerMercadoriasFornecedor(fornecedor: any) {
    this.fornecedorParaMercadorias = fornecedor;
    this.aba = 'mercadorias-fornecedor';
  }

  onVoltarDeMercadoriasFornecedor() {
    this.fornecedorParaMercadorias = null;
    this.aba = 'fornecedor';
  }
}
