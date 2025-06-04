import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Driver } from '../models/driver.model';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  constructor(private http: HttpClient) { }

  getDrivers(): Observable<Driver[]> {
    return this.http.get<Driver[]>('http://localhost:3000/Driver/all');
  }

  getDriver(id: any): Observable<Driver> {
    return this.http.get<Driver>(`http://localhost:3000/Driver/getbyid/${id}`);
  }

  addDriver(driver: Omit<Driver, 'id'>): Observable<Driver> {
    return this.http.post<Driver>('http://localhost:3000/Driver/add', driver);
  }

  updateDriver(driver: Driver): Observable<Driver> {
    return this.http.put<Driver>(`http://localhost:3000/Driver/update/${driver._id}`, driver);
  }

  deleteDriver(id: any): Observable<boolean> {
    return this.http.delete<boolean>(`http://localhost:3000/Driver/delete/${id}`);
  }

  getDriversByStatus(status: string): Observable<Driver[]> {
    return this.getDrivers().pipe(
      map(drivers => drivers.filter(d => d.status === status))
    );
  }

  getAvailableDrivers(): Observable<Driver[]> {
    return this.getDriversByStatus('Available');
  }

  getDriversStat() {
    return this.http.get<any>('http://localhost:3000/Driver/statistics');
  }

  getAvailableDriversStat() {
    return this.http.get<any>('http://localhost:3000/Driver/statistics/available');
  }

  getOnLeaveDriversStat() {
    return this.http.get<any>('http://localhost:3000/Driver/statistics/on-leave');
  }

  getOnMissionDriversStat() {
    return this.http.get<any>('http://localhost:3000/Driver/statistics/on-mission');
  }

  getDriversStatusPie(): Observable<{ available: number; onLeave: number; onMission: number }> {
    return this.http.get<{ available: number; onLeave: number; onMission: number }>('http://localhost:3000/Driver/statistics/drivers/status');
  }

  getDriversCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>('http://localhost:3000/Driver/statistics/drivers/count');
  }
}