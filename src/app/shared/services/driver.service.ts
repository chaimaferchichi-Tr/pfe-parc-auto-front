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
    return this.http.get<Driver[]>('https://backend-parc.onrender.com/Driver/all');
  }

  getDriver(id: any): Observable<Driver> {
    return this.http.get<Driver>(`https://backend-parc.onrender.com/Driver/getbyid/${id}`);
  }

  addDriver(driver: Omit<Driver, 'id'>): Observable<Driver> {
    return this.http.post<Driver>('https://backend-parc.onrender.com/Driver/add', driver);
  }

  updateDriver(driver: Driver): Observable<Driver> {
    return this.http.put<Driver>(`https://backend-parc.onrender.com/Driver/update/${driver._id}`, driver);
  }

  deleteDriver(id: any): Observable<boolean> {
    return this.http.delete<boolean>(`https://backend-parc.onrender.com/Driver/delete/${id}`);
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
    return this.http.get<any>('https://backend-parc.onrender.com/Driver/statistics');
  }

  getAvailableDriversStat() {
    return this.http.get<any>('https://backend-parc.onrender.com/Driver/statistics/available');
  }

  getOnLeaveDriversStat() {
    return this.http.get<any>('https://backend-parc.onrender.com/Driver/statistics/on-leave');
  }

  getOnMissionDriversStat() {
    return this.http.get<any>('https://backend-parc.onrender.com/Driver/statistics/on-mission');
  }

  getDriversStatusPie(): Observable<{ available: number; onLeave: number; onMission: number }> {
    return this.http.get<{ available: number; onLeave: number; onMission: number }>('https://backend-parc.onrender.com/Driver/statistics/drivers/status');
  }

  getDriversCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>('https://backend-parc.onrender.com/Driver/statistics/drivers/count');
  }
}