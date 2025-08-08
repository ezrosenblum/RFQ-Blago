// services/categories.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApiCategory,
  SaveUserCategoriesPayload,
} from '../models/material-categories';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly baseUrl = `${environment.apiUrl}Categories`;

  constructor(private http: HttpClient) {}
  getAll(): Observable<ApiCategory[]> {
    return this.http.get<ApiCategory[]>(`${this.baseUrl}/categories`);
  }
  getCategory(id: number) {
    return this.http.get(`${this.baseUrl}/category/${id}`);
  }

  getSubcategory(id: number) {
    return this.http.get(`${this.baseUrl}/subcategory/${id}`);
  }

  save(payload: SaveUserCategoriesPayload) {
    return this.http.put(`${environment.apiUrl}User/categories`, payload);
  }
}
