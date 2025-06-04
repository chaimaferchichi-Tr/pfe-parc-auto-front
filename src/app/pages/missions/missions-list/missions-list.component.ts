import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MissionService } from '../../../shared/services/mission.service';
import { Mission } from '../../../shared/models/mission.model';
import { UserService } from '../../../shared/services/user.service';
import { AuthService } from 'src/app/shared/services/auth.service';

// @ts-ignore
import Swal from 'sweetalert2';

@Component({
  selector: 'app-missions-list',
  templateUrl: './missions-list.component.html',
  styleUrls: ['./missions-list.component.scss'],
  standalone: false,
  // imports: [CommonModule, FormsModule, PaginationComponent]
})
export class MissionsListComponent implements OnInit {
  missions: Mission[] = [];
  filteredMissions: Mission[] = [];
  searchTerm = '';
  searchSubject = new Subject<string>();
  
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;
  
  loading = false;
  error: string | null = null;
  currentUserRole: string | null = null;
  
  constructor(
    private missionService: MissionService,
    private router: Router,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      //this.searchMissions();
    });
    const user = this.authService.currentUserValue;
    this.currentUserRole = user ? user.role : null;
  }
  
  ngOnInit(): void {
    this.loadMissions();
  }
  
  loadMissions(): void {
    this.loading = true;
    this.error = null;
    this.missionService.getMissions().subscribe({
      next: (missions) => {
        // If user is driver, filter missions to only their own
        const user = this.authService.currentUserValue;
        if (user && user.role === 'driver') {
          this.missions = this.authService.getDriverMissions(missions);
        } else {
          this.missions = missions;
        }
        this.filteredMissions = [...this.missions];
        this.totalItems = this.missions.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading missions:', err);
        this.error = 'Failed to load missions. Please try again.';
        this.loading = false;
      }
    });
  }
  
  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.missions];
    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(mission =>
        (mission.title && mission.title.toLowerCase().includes(term)) ||
        (mission.vehicle?.name && mission.vehicle.name.toLowerCase().includes(term)) ||
        (mission.driver?.user?.name && mission.driver.user.name.toLowerCase().includes(term)) ||
        (mission.status && mission.status.toLowerCase().includes(term)) ||
        (mission.priority && mission.priority.toLowerCase().includes(term)) ||
        (mission.notes && mission.notes.toLowerCase().includes(term)) ||
        (mission.startDate && new Date(mission.startDate).toLocaleDateString().includes(term)) ||
        (mission.endDate && new Date(mission.endDate).toLocaleDateString().includes(term))
      );
    }
    this.filteredMissions = result;
    this.totalItems = result.length;
    this.currentPage = 1;
  }
  
  // searchMissions(): void {
  //   if (!this.searchTerm.trim()) {
  //     this.filteredMissions = [...this.missions];
  //     this.totalItems = this.missions.length;
  //     return;
  //   }
    
  //   this.missionService.searchMissions(this.searchTerm).subscribe({
  //     next: (missions:any) => {
  //       this.filteredMissions = missions;
  //       this.totalItems = missions.length;
  //       this.currentPage = 1; // Reset to first page on new search
  //     },
  //     error: (err) => {
  //       console.error('Error searching missions:', err);
  //       this.error = 'Failed to search missions. Please try again.';
  //     }
  //   });
  // }
  
  onPageChange(page: number): void {
    this.currentPage = page;
  }
  
  viewMission(id: string): void {
    this.router.navigate(['/missions', id]);
  }
  
  editMission(id: string): void {
    this.router.navigate(['/missions/edit', id]);
  }
  
  deleteMission(id: string): void {
    this.missionService.deleteMission(id).subscribe({
      next: () => {
        this.loadMissions();
        this.router.navigate(['/missions']); // Always return to missions list
      },
      error: (err) => {
        console.error('Error deleting mission:', err);
        this.error = 'Failed to delete mission. Please try again.';
      }
    });
  }

  confirmDelete(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.deleteMission(id);
      }
    });
  }
  
  get paginatedMissions(): Mission[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredMissions.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  addNewMission(): void {
    this.router.navigate(['/missions/new']);
  }

  addFuelRecord(mission: Mission): void {
    // Navigate to the fuel record add form, passing the mission id (customize route as needed)
    this.router.navigate(['/fuel/new'], { queryParams: { missionId: mission._id } });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Planned':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  startMission(mission: Mission): void {
    if (!mission._id) return;
    this.missionService.updateMissionStatus(mission._id, 'In Progress').subscribe({
      next: () => {
        this.loadMissions();
      },
      error: (err) => {
        console.error('Error starting mission:', err);
        this.error = 'Failed to start mission. Please try again.';
      }
    });
  }

  openCancelMissionPopup(mission: Mission): void {
    Swal.fire({
      title: 'Cancel/Rejection Reason',
      input: 'textarea',
      inputLabel: 'Please provide a reason for cancelling/rejecting this mission:',
      inputPlaceholder: 'Type your reason here...',
      inputAttributes: {
        'aria-label': 'Reason for cancellation/rejection'
      },
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to write a reason!';
        }
        return null;
      }
    }).then((result: any) => {
      if (result.isConfirmed && result.value) {
        // Call backend to update mission with cancelReason
        this.missionService.updateMission({
          ...mission,
          cancelReason: result.value
        }).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Reclamation sent successfully!',
              showConfirmButton: false,
              timer: 1500
            });
            this.loadMissions();
          },
          error: () => {
            Swal.fire('Error', 'Failed to send reclamation.', 'error');
          }
        });
      }
    });
  }

  handleReclamation(mission: Mission): void {
    Swal.fire({
      title: 'Reclamation Reason',
      text: mission.cancelReason,
      icon: 'info',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Approve',
      denyButtonText: 'Disapprove',
      cancelButtonText: 'Close',
      confirmButtonColor: '#16a34a',
      denyButtonColor: '#dc2626',
    }).then((result: any) => {
      if (result.isConfirmed) {
        // Approve: set iscancelReasonAccepted: true, status: 'Cancelled'
        this.missionService.updateMission({
          ...mission,
          iscancelReasonAccepted: true,
          status: 'Cancelled'
        }).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Reclamation approved and mission cancelled!',
              showConfirmButton: false,
              timer: 1500
            });
            this.loadMissions();
          },
          error: () => {
            Swal.fire('Error', 'Failed to approve reclamation.', 'error');
          }
        });
      } else if (result.isDenied) {
        // Disapprove: set iscancelReasonRejected: true
        this.missionService.updateMission({
          ...mission,
          iscancelReasonRejected: true
        }).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Reclamation rejected!',
              showConfirmButton: false,
              timer: 1500
            });
            this.loadMissions();
          },
          error: () => {
            Swal.fire('Error', 'Failed to reject reclamation.', 'error');
          }
        });
      }
    });
  }
}