import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FornecedorService {
  private readonly api = `${environment.apiUrl}/fornecedores`;

  constructor(private http: HttpClient) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  criar(fornecedor: any): Observable<any> {
    return this.http.post<any>(this.api, fornecedor);
  }

  atualizar(id: number, fornecedor: any): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}`, fornecedor);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  listarMercadoriasDoFornecedor(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/${id}/mercadorias`);
  }
}
