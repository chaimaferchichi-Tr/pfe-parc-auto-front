import { Component, Input, OnInit } from '@angular/core';
import { VehicleService } from '../../shared/services/vehicle.service';
import { DriverService } from '../../shared/services/driver.service';
import { MissionService } from '../../shared/services/mission.service';
import { FuelService } from '../../shared/services/fuel.service';
import { saveAs } from 'file-saver';

@Component({
  standalone: false, // <-- ensure not standalone
  selector: 'app-fuel-report',
  templateUrl: './fuel-report.component.html',
  styleUrls: ['./fuel-report.component.scss']
})
export class FuelReportComponent implements OnInit {
  @Input() reportType: 'fuel-vehicle' | 'fuel-driver' | 'fuel-mission' = 'fuel-vehicle';

  vehicles: any[] = [];
  drivers: any[] = [];
  missions: any[] = [];

  selectedVehicle: string = '';
  selectedDriver: string = '';
  selectedMission: string = '';
  startDate: string = '';
  endDate: string = '';

  fuelData: any[] = [];
  loading = false;

  constructor(
    private vehicleService: VehicleService,
    private driverService: DriverService,
    private missionService: MissionService,
    private fuelService: FuelService
  ) {}

  ngOnInit() {
    this.loadDropdowns();
  }

  loadDropdowns() {
    this.vehicleService.getVehicles().subscribe(data => this.vehicles = data);
    this.driverService.getDrivers().subscribe(data => this.drivers = data);
    this.missionService.getMissions().subscribe(data => this.missions = data);
  }

  get title() {
    switch (this.reportType) {
      case 'fuel-driver': return 'Fuel Consumption by Driver';
      case 'fuel-mission': return 'Fuel Consumption by Mission';
      default: return 'Fuel Consumption by Vehicle';
    }
  }

  fetchFuelData() {
    this.loading = true;
    if (this.reportType === 'fuel-vehicle' && this.selectedVehicle) {
      this.fuelService.getFuelStatsByVehicle().subscribe(data => {
        this.fuelData = data.filter(d => d.vehicle_id === this.selectedVehicle);
        this.loading = false;
      });
    } else if (this.reportType === 'fuel-driver' && this.selectedDriver) {
      this.fuelService.getFuelStatsByDriver().subscribe(data => {
        this.fuelData = data.filter(d => d.driver_id === this.selectedDriver);
        this.loading = false;
      });
    } else if (this.reportType === 'fuel-mission' && this.selectedMission) {
      this.fuelService.getFuelStatsByMission().subscribe(data => {
        this.fuelData = data.filter(d => d.mission_id === this.selectedMission);
        this.loading = false;
      });
    } else {
      this.fuelData = [];
      this.loading = false;
    }
  }

  get totalCost(): number {
    return this.fuelData.reduce((sum, r) => sum + (r.totalCost || r.cost || 0), 0);
  }

  generatePDF() {
    if (this.reportType === 'fuel-vehicle' && this.selectedVehicle) {
      this.fuelService.downloadFuelVehicleReportPDF(this.selectedVehicle).subscribe(blob => {
        saveAs(blob, 'Fuel_Consumption_by_Vehicle.pdf');
      }, err => {
        alert('Failed to generate PDF report.');
      });
    } else {
      alert('Please select a vehicle to generate the report.');
    }
  }

  generateExcel() {
    if (this.reportType === 'fuel-vehicle' && this.selectedVehicle) {
      this.fuelService.downloadFuelVehicleReportExcel(this.selectedVehicle).subscribe(blob => {
        saveAs(blob, 'Fuel_Consumption_by_Vehicle.xlsx');
      }, err => {
        alert('Failed to generate Excel report.');
      });
    } else {
      alert('Please select a vehicle to generate the report.');
    }
  }
}
