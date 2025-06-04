import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { User } from '../../shared/models/user.model';
import { MissionService } from '../../shared/services/mission.service';
import { DriverService } from '../../shared/services/driver.service';
import { VehicleService } from '../../shared/services/vehicle.service';
import { FuelStockService } from '../../shared/services/fuel-stock.service';
import { MaintenanceService } from '../../shared/services/maintenance.service';
import { FuelService } from '../../shared/services/fuel.service';
import { ApexNonAxisChartSeries, ApexChart, ApexTitleSubtitle, ApexDataLabels } from 'ng-apexcharts';


export type FuelChartGroup = 'vehicle' | 'mission' | 'driver';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})

export class DashboardComponent implements OnInit {
  totalUsers = 0;
  activeUsers = 0;
  inactiveUsers = 0;
  recentUsers: User[] = [];
  usersByRole: {role: string, count: number}[] = [];
  
  // Mission stats
  missionStatusCounts: { status: string, count: number }[] = [];
  completedMissions = 0;
  cancelledMissions = 0;
  plannedMissions = 0;
  inProgressMissions = 0;

  // Vehicle stats
  availableVehicles = 0;
  onMissionVehicles = 0;
  inMaintenanceVehicles = 0;
  outOfServiceVehicles = 0;

  // Driver stats
  availableDrivers = 0;
  onLeaveDrivers = 0;
  onMissionDrivers = 0;
  totalDrivers = 0; // <-- Add this line

  // Fuel stats
  fuelByMission: any[] = [];
  fuelByVehicle: any[] = [];
  fuelByDriver: any[] = [];

  // Maintenance KPIs
  maintenanceStatusSeries: number[] = [];
  maintenanceStatusLabels: string[] = [];
  maintenanceTypeSeries: number[] = [];
  maintenanceTypeLabels: string[] = [];
  maintenanceMonthlySeries: { name: string; data: number[] }[] = [{ name: 'Maintenances', data: [] }];
  maintenanceMonthlyLabels: string[] = [];


  vehicleStatusChartData: any = {
    labels: ['Available', 'On Mission', 'In Maintenance', 'Out of Service'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: ['#22c55e', '#3b82f6', '#f59e42', '#ef4444'],
    }]
  };
  driverStatusChartData: any = {
    labels: ['Available', 'On Leave', 'On Mission'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#22c55e', '#f59e42', '#3b82f6'],
    }]
  };
  fuelByVehicleChartData: any = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#3b82f6', '#f59e42', '#22c55e', '#ef4444', '#a855f7'],
    }]
  };
  missionStatusChartDataNgx: any[] = [
    { name: 'Completed', value: 40 },
    { name: 'In Progress', value: 25 },
    { name: 'Pending', value: 20 },
    { name: 'Failed', value: 15 }
  ];
  kendoMissionStatusData: any[] = [
    { category: 'Completed', value: 40 },
    { category: 'In Progress', value: 25 },
    { category: 'Pending', value: 20 },
    { category: 'Failed', value: 15 }
  ];

  loading = false;
  error: string | null = null;

  colorScheme = {
    domain: ['#22c55e', '#f59e42', '#3b82f6', '#ef4444']
  };

  // Mission Status: Pie chart
  series: ApexNonAxisChartSeries = [40, 25, 20, 15];
  chart: ApexChart = {
    type: 'pie',
    width: 420,
    height: 420
  };
  title: ApexTitleSubtitle = {
    text: 'Mission Status Distribution'
  };
  labels: string[] = ['Completed', 'In Progress', 'Pending', 'Failed'];
  dataLabels: ApexDataLabels = {
    enabled: true,
    formatter: function (val: number, opts?: any) {
      return val.toFixed(0);
    }
  };

  // ApexCharts config for Vehicle Status
  vehicleSeries: ApexNonAxisChartSeries = [0, 0, 0, 0];
  vehicleChart: ApexChart = {
    type: 'donut',
    width: 300
  };
  vehicleTitle: ApexTitleSubtitle = {
    text: 'Vehicle Status'
  };
  vehicleLabels: string[] = ['Available', 'On Mission', 'In Maintenance', 'Out of Service'];
  vehicleDataLabels: ApexDataLabels = {
    enabled: true,
    formatter: function (val: number, opts?: any) {
      return val.toFixed(0);
    }
  };

  // Vehicle Status: Bar chart
  vehicleSeriesBar = [{
    name: 'Vehicles',
    data: [0, 0, 0, 0]
  }];
  vehicleChartBar: ApexChart = {
    type: 'bar',
    width: 420,
    height: 420
  };
  vehicleTitleBar: ApexTitleSubtitle = {
    text: 'Vehicle Status Overview'
  };
  vehicleLabelsBar: string[] = ['Available', 'On Mission', 'In Maintenance', 'Out of Service'];

  // Driver Status: RadialBar chart
  driverSeriesRadial: ApexNonAxisChartSeries = [0, 0, 0];
  driverChartRadial: ApexChart = {
    type: 'radialBar',
    width: 420,
    height: 420
  };
  driverTitleRadial: ApexTitleSubtitle = {
    text: 'Driver Availability'
  };
  driverLabelsRadial: string[] = ['Available', 'On Leave', 'On Mission'];

  // --- Driver Status Pie Chart ---
  driverStatusSeries: number[] = [0, 0, 0];
  driverStatusLabels: string[] = ['Available', 'On Leave', 'On Mission'];

  // ApexCharts config for Fuel Consumption by Vehicle
  fuelVehicleSeries: ApexNonAxisChartSeries = [];
  fuelVehicleChart: ApexChart = {
    type: 'donut',
    width: 300
  };
  fuelVehicleTitle: ApexTitleSubtitle = {
    text: 'Fuel Consumption by Vehicle'
  };
  fuelVehicleLabels: string[] = [];
  fuelVehicleDataLabels: ApexDataLabels = {
    enabled: true,
    formatter: function (val: number, opts?: any) {
      return val.toFixed(0);
    }
  };

  // Fuel Consumption by Vehicle: Horizontal Bar chart
  fuelVehicleSeriesBar: { name: string; data: number[] }[] = [{
    name: 'Fuel (Liters)',
    data: []
  }];
  fuelVehicleChartBar: ApexChart = {
    type: 'bar',
    width: 350,
    height: 300
  };
  fuelVehicleTitleBar: ApexTitleSubtitle = {
    text: 'Fuel Consumption per Vehicle'
  };
  fuelVehicleLabelsBar: string[] = [];

  fuelVehicleChartBarHorizontal: ApexChart = {
    type: 'bar',
    width: 420,
    height: 420,
    stacked: false,
    toolbar: { show: false }
  };
  fuelVehiclePlotOptions = {
    bar: { horizontal: true }
  };

  // ApexCharts config for Fuel Consumption by Mission
  fuelMissionSeriesBar: { name: string; data: number[] }[] = [{ name: 'Fuel (Liters)', data: [] }];
  fuelMissionChartBar: ApexChart = {
    type: 'bar',
    width: 420,
    height: 420
  };
  fuelMissionTitleBar: ApexTitleSubtitle = {
    text: 'Fuel Consumption per Mission'
  };
  fuelMissionLabelsBar: string[] = [];

  // ApexCharts config for Fuel Consumption by Driver
  fuelDriverSeriesBar: { name: string; data: number[] }[] = [{ name: 'Fuel (Liters)', data: [] }];
  fuelDriverChartBar: ApexChart = {
    type: 'bar',
    width: 420,
    height: 420
  };
  fuelDriverTitleBar: ApexTitleSubtitle = {
    text: 'Fuel Consumption per Driver'
  };
  fuelDriverLabelsBar: string[] = [];

  // Fuel dynamic chart
  fuelChartGroup: FuelChartGroup = 'vehicle'; // default
  fuelChartLoading = false;
  fuelChartLabels: string[] = [];
  fuelChartSeries: { name: string; data: number[] }[] = [];
  fuelChartTitle = 'Fuel Consumption by Vehicle';
  fuelChartBar: ApexChart = {
    type: 'bar',
    width: 420,
    height: 420
  };

  // --- Maintenance Status Distribution (Switchable Pie/Donut) ---
  maintenanceStatusDistributionData: any = { week: {}, month: {}, year: {} };
  maintenanceStatusPeriod: 'week' | 'month' | 'year' = 'week';
  maintenanceStatusPeriodKeys: string[] = [];
  maintenanceStatusPeriodKey: string = '';
  maintenanceStatusChartSeries: number[] = [];
  maintenanceStatusChartLabels: string[] = [];
  maintenanceStatusChartLoading = false;

  // --- Maintenance Cost by Type (Monthly) ---
  maintenanceMonthlyTypeData: any[] = [];
  maintenanceMonthlyTypeLabels: string[] = [];
  maintenanceMonthlyTypeSeries: any[] = [];
  maintenanceMonthlyTypeChart: any = {
    type: 'bar',
    width: 420,
    height: 420,
    stacked: false,
    toolbar: { show: false }
  };

  darkChartColors = [
    '#dc2626', 
    '#2563eb', 
    '#22d3ee', 
    '#fbbf24', 
    '#a855f7', 
    '#f472b6', 
    '#16a34a', 
  ];
  lightChartColors = [
    '#22c55e',
    '#3b82f6', 
    '#f59e42', 
    '#ef4444', 
    '#a855f7', 
    '#fbbf24',
    '#0ea5e9', 
  ];

  constructor(
    private userService: UserService,
    private missionService: MissionService,
    private driverService: DriverService,
    private vehicleService: VehicleService,
    private fuelStockService: FuelStockService,
    private maintenanceService: MaintenanceService, // <-- inject
    private fuelService: FuelService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadStatistics();
    this.loadMaintenanceStats();
    this.loadFuelChart();
    this.loadMaintenanceStatusDistribution();
    this.loadMaintenanceMonthlyType();
    this.lastFuelChartGroup = this.fuelChartGroup;
  }

  lastFuelChartGroup: FuelChartGroup = 'vehicle';

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.totalUsers = users.length;
        this.activeUsers = users.filter(u => u.statuts_account === 'active').length;
        this.inactiveUsers = this.totalUsers - this.activeUsers;
        
        // Get 5 most recent users
        this.recentUsers = [...users]
          .sort((a, b) => {
            // Use createdAt (string) and convert to Date
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5);
        
        // Count users by role
        const roleCount = new Map<string, number>();
        users.forEach(user => {
          const count = roleCount.get(user.role) || 0;
          roleCount.set(user.role, count + 1);
        });
        
        this.usersByRole = Array.from(roleCount.entries()).map(([role, count]) => ({
          role,
          count
        }));
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.error = 'Failed to load dashboard data. Please try again.';
        this.loading = false;
      }
    });
  }

  loadStatistics(): void {
    // Mission status counts
    this.missionService.getMissionStatusCounts().subscribe({
      next: (data) => {
        this.missionStatusCounts = data;
        this.series = data.map((d: any) => d.count);
        this.labels = data.map((d: any) => d._id);
      },
      error: () => {}
    });
    // Mission status details
    this.missionService.getCompletedMissions().subscribe({ next: d => this.completedMissions = d.count, error: () => {} });
    this.missionService.getCancelledMissions().subscribe({ next: d => this.cancelledMissions = d.count, error: () => {} });
    this.missionService.getPlannedMissions().subscribe({ next: d => this.plannedMissions = d.count, error: () => {} });
    this.missionService.getInProgressMissions().subscribe({ next: d => this.inProgressMissions = d.count, error: () => {} });

    // Vehicle stats (donut)
    this.vehicleService.getAvailableVehiclesStat().subscribe({ next: d => { this.availableVehicles = d.count; this.updateVehicleSeries(); }, error: () => {} });
    this.vehicleService.getOnMissionVehiclesStat().subscribe({ next: d => { this.onMissionVehicles = d.count; this.updateVehicleSeries(); }, error: () => {} });
    this.vehicleService.getInMaintenanceVehiclesStat().subscribe({ next: d => { this.inMaintenanceVehicles = d.count; this.updateVehicleSeries(); }, error: () => {} });
    this.vehicleService.getOutOfServiceVehiclesStat().subscribe({ next: d => { this.outOfServiceVehicles = d.count; this.updateVehicleSeries(); }, error: () => {} });

    // Driver stats (radialBar)
    const updateDriverRadial = () => {
      this.driverSeriesRadial = [
        this.availableDrivers,
        this.onLeaveDrivers,
        this.onMissionDrivers
      ];
    };
    this.driverService.getAvailableDriversStat().subscribe({ next: d => { this.availableDrivers = d.count; updateDriverRadial(); }, error: () => {} });
    this.driverService.getOnLeaveDriversStat().subscribe({ next: d => { this.onLeaveDrivers = d.count; updateDriverRadial(); }, error: () => {} });
    this.driverService.getOnMissionDriversStat().subscribe({ next: d => { this.onMissionDrivers = d.count; updateDriverRadial(); }, error: () => {} });

    // Driver status pie chart
    this.driverService.getDriversStatusPie().subscribe({
      next: (data) => {
        this.driverStatusSeries = [data.available, data.onLeave, data.onMission];
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    // Fuel stats (horizontal bar for vehicle)
    this.fuelStockService.getFuelConsumptionByVehicle().subscribe({
      next: d => {
        if (Array.isArray(d) && d.length > 0) {
          this.fuelByVehicle = d;
          this.fuelVehicleSeriesBar = [{
            name: 'Fuel (Liters)',
            data: d.map((item: any) => item.totalFuel)
          }];
          this.fuelVehicleLabelsBar = d.map((item: any) => item._id);
        } else {
          this.fuelVehicleSeriesBar = [{ name: 'Fuel (Liters)', data: [] }];
          this.fuelVehicleLabelsBar = [];
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.fuelVehicleSeriesBar = [{ name: 'Fuel (Liters)', data: [] }];
        this.fuelVehicleLabelsBar = [];
      }
    });

    // Fuel stats (bar for mission)
    this.fuelStockService.getFuelConsumptionByMission().subscribe({
      next: d => {
        if (Array.isArray(d) && d.length > 0) {
          this.fuelByMission = d;
          this.fuelMissionSeriesBar = [{
            name: 'Fuel (Liters)',
            data: d.map((item: any) => item.totalFuel)
          }];
          this.fuelMissionLabelsBar = d.map((item: any) => item._id);
        } else {
          this.fuelMissionSeriesBar = [{ name: 'Fuel (Liters)', data: [] }];
          this.fuelMissionLabelsBar = [];
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.fuelMissionSeriesBar = [{ name: 'Fuel (Liters)', data: [] }];
        this.fuelMissionLabelsBar = [];
      }
    });

    // Fuel stats (bar for driver)
    this.fuelStockService.getFuelConsumptionByDriver().subscribe({
      next: d => {
        if (Array.isArray(d) && d.length > 0) {
          this.fuelByDriver = d;
          this.fuelDriverSeriesBar = [{
            name: 'Fuel (Liters)',
            data: d.map((item: any) => item.totalFuel)
          }];
          this.fuelDriverLabelsBar = d.map((item: any) => item._id);
        } else {
          this.fuelDriverSeriesBar = [{ name: 'Fuel (Liters)', data: [] }];
          this.fuelDriverLabelsBar = [];
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.fuelDriverSeriesBar = [{ name: 'Fuel (Liters)', data: [] }];
        this.fuelDriverLabelsBar = [];
      }
    });

    // Fetch total drivers count for stats card
    this.driverService.getDriversCount().subscribe({
      next: d => this.totalDrivers = d.count,
      error: () => { this.totalDrivers = 0; }
    });
  }

  driverSeries: number[] = [0, 0, 0];

  updateVehicleSeries() {
    this.vehicleSeries = [
      this.availableVehicles,
      this.onMissionVehicles,
      this.inMaintenanceVehicles,
      this.outOfServiceVehicles
    ];
  }

  updateDriverSeries() {
    this.driverSeries = [
      this.availableDrivers,
      this.onLeaveDrivers,
      this.onMissionDrivers
    ];
  }

  getApexAxisColors(): string | string[] {
    // Simple check for dark mode; adapt if you use a different theme system
    return document.documentElement.classList.contains('dark')
      ? ['#f3f4f6'] // light gray for dark bg
      : ['#374151']; // dark gray for light bg
  }

  getChartColors(): string[] {
    return document.documentElement.classList.contains('dark')
      ? this.darkChartColors
      : this.lightChartColors;
  }

  // ApexCharts options for dark/light mode
  getApexOptions(): any {
    const isDark = document.documentElement.classList.contains('dark');
    return {
      legend: {
        labels: {
          colors: isDark ? '#f3f4f6' : '#374151'
        }
      },
      dataLabels: {
        style: {
          colors: [isDark ? '#f3f4f6' : '#374151']
        }
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light'
      }
    };
  }

  loadMaintenanceStats(): void {
    // Maintenance Status Distribution (Pie)
    this.maintenanceService.getMaintenanceStatusStats().subscribe(data => {
      this.maintenanceStatusSeries = data.map((d: any) => d.count);
      this.maintenanceStatusLabels = data.map((d: any) => d._id);
      this.cdr.detectChanges();
    });

    // Maintenance Type Distribution (Pie)
    this.maintenanceService.getMaintenanceTypeStats().subscribe(data => {
      this.maintenanceTypeSeries = data.map((d: any) => d.count);
      this.maintenanceTypeLabels = data.map((d: any) => d._id);
      this.cdr.detectChanges();
    });

    // Maintenance Monthly Trend (Bar)
    this.maintenanceService.getMaintenanceMonthlyStats().subscribe(data => {
      this.maintenanceMonthlySeries = [{
        name: 'Maintenances',
        data: data.map((d: any) => d.count)
      }];
      this.maintenanceMonthlyLabels = data.map((d: any) => d._id);
      this.cdr.detectChanges();
    });
  }

  onFuelChartGroupChange(group: FuelChartGroup) {
    // Only reload the fuel chart if the group changes, do not reload dashboard stats
    this.fuelChartGroup = group;
    this.loadFuelChart();
    this.lastFuelChartGroup = group;
  }

  loadFuelChart() {
    this.fuelChartLoading = true;
    let obs$;
    if (this.fuelChartGroup === 'vehicle') {
      obs$ = this.fuelService.getFuelStatsByVehicle();
      this.fuelChartTitle = 'Fuel Consumption by Vehicle';
    } else if (this.fuelChartGroup === 'mission') {
      obs$ = this.fuelService.getFuelStatsByMission();
      this.fuelChartTitle = 'Fuel Consumption by Mission';
    } else {
      obs$ = this.fuelService.getFuelStatsByDriver();
      this.fuelChartTitle = 'Fuel Consumption by Driver';
    }
    obs$.subscribe({
      next: (data: any[]) => {
        if (data && data.length > 0) {
          let labelKey = 'vehicle_name', idKey = 'vehicle_id', quantityKey = 'totalQuantity', costKey = 'totalCost';
          if (this.fuelChartGroup === 'mission') {
            labelKey = data[0].mission_name !== undefined ? 'mission_name' : 'mission';
            quantityKey = data[0].fuel_consumption !== undefined ? 'fuel_consumption' : 'totalQuantity';
            costKey = data[0].total_cost !== undefined ? 'total_cost' : 'totalCost';
          }
          if (this.fuelChartGroup === 'driver') {
            labelKey = data[0].driver_name !== undefined ? 'driver_name' : 'driver';
            // Fallback for null driver_name
            this.fuelChartLabels = data.map(item => item[labelKey] || 'Unknown');
          } else {
            this.fuelChartLabels = data.map(item => item[labelKey]);
          }
          this.fuelChartSeries = [
            { name: 'Quantity (L)', data: data.map(item => item[quantityKey] || 0) },
            { name: 'Cost', data: data.map(item => item[costKey] || 0) }
          ];
        } else {
          this.fuelChartLabels = [];
          this.fuelChartSeries = [
            { name: 'Quantity (L)', data: [] },
            { name: 'Cost', data: [] }
          ];
        }
        this.fuelChartLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.fuelChartLabels = [];
        this.fuelChartSeries = [
          { name: 'Quantity (L)', data: [] },
          { name: 'Cost', data: [] }
        ];
        this.fuelChartLoading = false;
      }
    });
  }

  loadMaintenanceStatusDistribution() {
    this.maintenanceStatusChartLoading = true;
    this.maintenanceService.getMaintenanceStatusDistribution().subscribe({
      next: (data) => {
        this.maintenanceStatusDistributionData = data || { week: {}, month: {}, year: {} };
        this.maintenanceStatusPeriodKeys = Object.keys(this.maintenanceStatusDistributionData[this.maintenanceStatusPeriod] || {});
        this.maintenanceStatusPeriodKey = this.maintenanceStatusPeriodKeys[0] || '';
        this.updateMaintenanceStatusChart();
        this.maintenanceStatusChartLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.maintenanceStatusDistributionData = { week: {}, month: {}, year: {} };
        this.maintenanceStatusPeriodKeys = [];
        this.maintenanceStatusPeriodKey = '';
        this.maintenanceStatusChartSeries = [];
        this.maintenanceStatusChartLabels = [];
        this.maintenanceStatusChartLoading = false;
      }
    });
  }

  onMaintenanceStatusPeriodChange(period: 'week' | 'month' | 'year') {
    this.maintenanceStatusPeriod = period;
    this.maintenanceStatusPeriodKeys = Object.keys(this.maintenanceStatusDistributionData[period] || {});
    this.maintenanceStatusPeriodKey = this.maintenanceStatusPeriodKeys[0] || '';
    this.updateMaintenanceStatusChart();
  }

  updateMaintenanceStatusChart() {
    const periodData = this.maintenanceStatusDistributionData[this.maintenanceStatusPeriod] || {};
    const statusCounts = periodData[this.maintenanceStatusPeriodKey] || { pending: 0, done: 0, cancelled: 0 };
    this.maintenanceStatusChartLabels = ['Pending', 'Done', 'Cancelled'];
    this.maintenanceStatusChartSeries = [statusCounts.pending || 0, statusCounts.done || 0, statusCounts.cancelled || 0];
    this.cdr.detectChanges();
  }

  loadMaintenanceMonthlyType() {
    this.maintenanceService.getMaintenanceMonthlyType().subscribe({
      next: (data) => {
        this.maintenanceMonthlyTypeData = data || [];
        this.maintenanceMonthlyTypeLabels = data.map((item: any) => item.title);
        this.maintenanceMonthlyTypeSeries = [
          {
            name: 'Preventive',
            data: data.map((item: any) => item.preventiveCost || 0)
          },
          {
            name: 'Corrective',
            data: data.map((item: any) => item.correctiveCost || 0)
          }
        ];
        this.cdr.detectChanges();
      },
      error: () => {
        this.maintenanceMonthlyTypeData = [];
        this.maintenanceMonthlyTypeLabels = [];
        this.maintenanceMonthlyTypeSeries = [];
      }
    });
  }

}