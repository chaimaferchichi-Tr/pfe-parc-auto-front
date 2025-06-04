import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mission } from '../models/mission.model';

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  private apiUrl = 'http://localhost:3000/Mission'; 
  constructor(private http: HttpClient) {}

  getMissions(): Observable<Mission[]> {
    return this.http.get<Mission[]>(`${this.apiUrl}/all`);
  }

  getMission(id: string): Observable<Mission> {
    return this.http.get<Mission>(`${this.apiUrl}/getbyid/${id}`);
  }

  addMission(mission: Partial<Mission>): Observable<Mission> {
    return this.http.post<Mission>(`${this.apiUrl}/create`, mission);
  }

  updateMission(mission: Mission): Observable<Mission> {
    return this.http.put<Mission>(`${this.apiUrl}/update/${mission._id}`, mission);
  }

  updateMissionStatus(id: string, status: string): Observable<Mission> {
    return this.http.put<Mission>(`${this.apiUrl}/updatestatus/${id}`, { status });
  }

  deleteMission(id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}/supprimer/${id}`);
  }

  getMissionsByDriver(driverId: any): Observable<Mission[]> {
    return this.http.get<Mission[]>(`${this.apiUrl}/bydriver/${driverId}`);
  }

  getMissionsByVehicle(vehicleId: any): Observable<Mission[]> {
    return this.http.get<Mission[]>(`${this.apiUrl}/byvehicle/${vehicleId}`);
  }

  getMissionStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics`);
  }

  getMissionStatusCounts() {
    return this.http.get<any>(`${this.apiUrl}/statistics/status-counts`);
  }
  getCompletedMissions() {
    return this.http.get<any>(`${this.apiUrl}/statistics/completed`);
  }
  getCancelledMissions() {
    return this.http.get<any>(`${this.apiUrl}/statistics/cancelled`);
  }
  getPlannedMissions() {
    return this.http.get<any>(`${this.apiUrl}/statistics/planned`);
  }
  getInProgressMissions() {
    return this.http.get<any>(`${this.apiUrl}/statistics/in-progress`);
  }
}