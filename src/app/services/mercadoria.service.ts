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

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.api);
  }

  criar(mercadoria: any): Observable<any> {
    return this.http.post<any>(this.api, mercadoria);
  }

  atualizar(id: number, mercadoria: any): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}`, mercadoria);
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
