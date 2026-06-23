import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MercadoriaService {
  private readonly api = `${environment.apiUrl}/mercadorias`;

  constructor(private http: HttpClient) {}

  listar(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.api}?page=${page}&size=${size}`);
  }

  listarInativos(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.api}/inativos?page=${page}&size=${size}`);
  }

  criar(mercadoria: any): Observable<any> {
    return this.http.post<any>(this.api, mercadoria);
  }

  atualizar(id: number, mercadoria: any): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}`, mercadoria);
  }

  atualizarQuantidade(id: number, mercadoria: any, quantidade: number): Observable<any> {
    const payload = {
      ...mercadoria,
      quantidade,
      fornecedorId: mercadoria?.fornecedor?.id ?? mercadoria?.fornecedorId,
    };
    delete payload.fornecedor;

    return this.atualizar(id, payload);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  reativar(id: number): Observable<any> {
    return this.http.patch<any>(`${this.api}/${id}/reativar`, {});
  }
}
