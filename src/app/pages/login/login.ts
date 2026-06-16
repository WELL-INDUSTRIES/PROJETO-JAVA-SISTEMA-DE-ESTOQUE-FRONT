import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
})
export class Login {
  @Output() autenticado = new EventEmitter<void>();

  usuario = '';
  senha = '';
  erro = '';
  carregando = false;

  // Credenciais de acesso (simuladas — sem backend de autenticação)
  private readonly USUARIO_VALIDO = 'admin';
  private readonly SENHA_VALIDA = 'admin123';

  entrar() {
    this.erro = '';

    if (!this.usuario.trim() || !this.senha.trim()) {
      this.erro = 'Preencha usuário e senha.';
      return;
    }

    this.carregando = true;

    // Simula latência de rede
    setTimeout(() => {
      if (
        this.usuario.trim() === this.USUARIO_VALIDO &&
        this.senha === this.SENHA_VALIDA
      ) {
        sessionStorage.setItem('autenticado', 'true');
        this.autenticado.emit();
      } else {
        this.erro = 'Usuário ou senha inválidos.';
      }

      this.carregando = false;
    }, 400);
  }
}
