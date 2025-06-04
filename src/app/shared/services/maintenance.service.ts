import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Maintenance } from '../models/maintenance.model';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private apiUrl = 'http://localhost:3000/Maintenance';

  constructor(private http: HttpClient) {}

  createMaintenance(data: Partial<Maintenance>): Observable<Maintenance> {
    return this.http.post<Maintenance>(`${this.apiUrl}/create`, data);
  }

  getAllMaintenances(): Observable<Maintenance[]> {
    return this.http.get<Maintenance[]>(`${this.apiUrl}/all`);
  }

  getMaintenanceById(id: string): Observable<Maintenance> {
    return this.http.get<Maintenance>(`${this.apiUrl}/getbyid/${id}`);
  }

  getMaintenancesByUser(idUser: string): Observable<Maintenance[]> {
    return this.http.get<Maintenance[]>(`${this.apiUrl}/getbyidUser/${idUser}`);
  }

  updateMaintenance(id: string, data: Partial<Maintenance>): Observable<Maintenance> {
    return this.http.put<Maintenance>(`${this.apiUrl}/update/${id}`, data);
  }

  deleteMaintenance(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/supprimer/${id}`);
  }
  // maintenance.service.ts
  getMaintenanceStatusStats() {
  return this.http.get<any[]>('http://localhost:3000/Maintenance/statistics/maintenance/status');
  }
  getMaintenanceTypeStats() {
    return this.http.get<any[]>('http://localhost:3000/Maintenance/statistics/maintenance/type');
  }
  getMaintenanceMonthlyStats() {
    return this.http.get<any[]>('http://localhost:3000/Maintenance/statistics/maintenance/monthly');
  }
  getMaintenanceStatusDistribution() {
    return this.http.get<any>('http://localhost:3000/Maintenance/statistics/maintenance/status-distribution');
  }
  getMaintenanceMonthlyType() {
    return this.http.get<any[]>('http://localhost:3000/Maintenance/statistics/maintenance/monthly-type');
  }
}
