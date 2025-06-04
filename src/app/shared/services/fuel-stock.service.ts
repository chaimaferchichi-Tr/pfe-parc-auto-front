import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FuelStock } from '../models/fuel-stock.model';

@Injectable({ providedIn: 'root' })
export class FuelStockService {
  private apiUrl = 'https://backend-parc.onrender.com/FuelStock';

  constructor(private http: HttpClient) {}

  getAll(): Observable<FuelStock[]> {
    return this.http.get<FuelStock[]>(`${this.apiUrl}/all`);
  }

  getById(id: string): Observable<FuelStock> {
    return this.http.get<FuelStock>(`${this.apiUrl}/getbyid/${id}`);
  }

  create(stock: Partial<FuelStock>): Observable<FuelStock> {
    return this.http.post<FuelStock>(`${this.apiUrl}/create`, stock);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

  getFuelConsumptionByMission() {
    return this.http.get<any[]>(`${this.apiUrl}/statistics/consumption/by-mission`);
  }
  getFuelConsumptionByVehicle() {
    return this.http.get<any[]>(`${this.apiUrl}/statistics/consumption/by-vehicle`);
  }
  getFuelConsumptionByDriver() {
    return this.http.get<any[]>(`${this.apiUrl}/statistics/consumption/by-driver`);
  }
}
