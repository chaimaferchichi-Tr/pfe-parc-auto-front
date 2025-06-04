import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Vehicle } from '../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private vehicles: Vehicle[] = [
 
  ];

  private nextId = 9;

  constructor(private http: HttpClient) {}

  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>('http://localhost:3000/Vehicle/all');
  }

  getVehicle(id: any): Observable<Vehicle | undefined> {
    return this.http.get<Vehicle>(`http://localhost:3000/Vehicle/getbyid/${id}`);
  }

  searchVehicles(searchTerm: string): Observable<Vehicle[]> {
    const term = searchTerm.toLowerCase();
    const filteredVehicles = this.vehicles.filter(vehicle => 
      vehicle.name.toLowerCase().includes(term) ||
      vehicle.type.toLowerCase().includes(term) ||
      vehicle.licensePlate.toLowerCase().includes(term) ||
      vehicle.status.toLowerCase().includes(term) ||
      vehicle.fuelType.toLowerCase().includes(term)
    );
    return of(filteredVehicles);
  }


addVehicle(vehicle: Omit<Vehicle, 'id'>): Observable<Vehicle> {
  return this.http.post<Vehicle>('http://localhost:3000/Vehicle/ajout', vehicle);
}
  updateVehicle(vehicle: Vehicle): Observable<Vehicle> {
    console.log('Updating vehicle with data:', vehicle); // Debugging log
    return this.http.put<Vehicle>(`http://localhost:3000/Vehicle/update/${vehicle._id}`, vehicle);
  }

  deleteVehicle(id: any): Observable<boolean> {
    // Call backend API to delete vehicle
    return this.http.delete<boolean>(`http://localhost:3000/Vehicle/supprimer/${id}`);
  }

  getVehicleStatistics(): Observable<{
    total: number;
    available: number;
    onMission: number;
    inMaintenance: number;
    outOfService: number;
    byType: {type: string, count: number}[];
  }> {
    const stats = {
      total: this.vehicles.length,
      available: this.vehicles.filter(v => v.status === 'Available').length,
      onMission: this.vehicles.filter(v => v.status === 'On Mission').length,
      inMaintenance: this.vehicles.filter(v => v.status === 'In Maintenance').length,
      outOfService: this.vehicles.filter(v => v.status === 'Out of Service').length,
      byType: [] as {type: string, count: number}[]
    };

    // Count vehicles by type
    const typeCount = new Map<string, number>();
    this.vehicles.forEach(vehicle => {
      const count = typeCount.get(vehicle.type) || 0;
      typeCount.set(vehicle.type, count + 1);
    });
    
    stats.byType = Array.from(typeCount.entries()).map(([type, count]) => ({
      type,
      count
    }));
    
    return of(stats);
  }

  getAvailableVehiclesStat() {
    return this.http.get<any>('http://localhost:3000/Vehicle/statistics/available');
  }
  getOnMissionVehiclesStat() {
    return this.http.get<any>('http://localhost:3000/Vehicle/statistics/on-mission');
  }
  getInMaintenanceVehiclesStat() {
    return this.http.get<any>('http://localhost:3000/Vehicle/statistics/in-maintenance');
  }
  getOutOfServiceVehiclesStat() {
    return this.http.get<any>('http://localhost:3000/Vehicle/statistics/out-of-service');
  }
}
