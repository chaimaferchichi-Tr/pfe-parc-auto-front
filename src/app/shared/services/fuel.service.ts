import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FuelRecord } from '../models/fuel-record.model';

@Injectable({
  providedIn: 'root'
})
export class FuelService {
  private apiUrl = 'http://localhost:3000/Fuel';

  constructor(private http: HttpClient) { }

  getFuelRecords(): Observable<FuelRecord[]> {
    return this.http.get<FuelRecord[]>(`${this.apiUrl}/all`);
  }

  getFuelRecord(id: string): Observable<FuelRecord> {
    return this.http.get<FuelRecord>(`${this.apiUrl}/getbyid/${id}`);
  }

  addFuelRecord(fuelRecord: Partial<FuelRecord>): Observable<FuelRecord> {
    return this.http.post<FuelRecord>(`${this.apiUrl}/create`, fuelRecord);
  }

  updateFuelRecord(id: string, fuelRecord: Partial<FuelRecord>): Observable<FuelRecord> {
    return this.http.put<FuelRecord>(`${this.apiUrl}/update/${id}`, fuelRecord);
  }

  getFuelRecordsByUser(userId: string): Observable<FuelRecord[]> {
    return this.http.get<FuelRecord[]>(`${this.apiUrl}/getbyidUser/${userId}`);
  }

  deleteFuel(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

  deleteFuelRecord(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

  getFuelStatsByMission(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/statistics/fuel/by-mission`);
}

getFuelStatsByVehicle(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/statistics/fuel/by-vehicle`);
}

getFuelStatsByDriver(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/statistics/fuel/by-driver`);
}

downloadFuelVehicleReportPDF(vehicleId: string): Observable<Blob> {
  return this.http.get(`${this.apiUrl}/report/pdf/by-vehicle/${vehicleId}`, { responseType: 'blob' });
}

downloadFuelVehicleReportExcel(vehicleId: string): Observable<Blob> {
  return this.http.get(`${this.apiUrl}/report/excel/by-vehicle/${vehicleId}`, { responseType: 'blob' });
}

getFuelConsumptionByVehicleMissions(vehicleId: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/statistics/fuel/by-vehicle-missions/${vehicleId}`);
}
}

