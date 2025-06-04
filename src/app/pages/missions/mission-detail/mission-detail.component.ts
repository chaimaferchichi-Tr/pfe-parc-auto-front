import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MissionService } from '../../../shared/services/mission.service';
import { VehicleService } from '../../../shared/services/vehicle.service';
import { UserService } from '../../../shared/services/user.service';
import { Mission } from '../../../shared/models/mission.model';
import { Vehicle } from '../../../shared/models/vehicle.model';
import { User } from '../../../shared/models/user.model';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-mission-detail',
  templateUrl: './mission-detail.component.html',
  styleUrls: ['./mission-detail.component.scss'],
  standalone: false,
  // imports: [CommonModule, DatePipe]
})
export class MissionDetailComponent implements OnInit {
  mission: Mission | null = null;
  vehicle: Vehicle | null = null;
  driver: any | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private missionService: MissionService,
    private vehicleService: VehicleService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadMission(id);
      }
    });
  }

  loadMission(id: string): void {
    this.loading = true;
    this.error = null;
    this.missionService.getMission(id).subscribe({
      next: (mission) => {
        console.log('Mission loaded details:', mission);
        this.mission = mission || null;
        if (mission?.vehicle) {
          this.vehicle = mission.vehicle;
        }
        if (mission?.driver) {
          this.driver = mission.driver;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load mission details. Please try again.';
        this.loading = false;
      }
    });
  }

  editMission(): void {
    if (this.mission) {
      this.router.navigate(['/missions/edit', this.mission._id]);
    }
  }

  deleteMission(): void {
    if (this.mission && confirm('Are you sure you want to delete this mission?')) {
      this.missionService.deleteMission(this.mission._id).subscribe({
        next: () => this.router.navigate(['/missions']),
        error: (err) => {
          this.error = 'Failed to delete mission.';
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/missions']);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Planned': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}