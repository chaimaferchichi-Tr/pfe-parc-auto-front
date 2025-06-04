import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../../shared/models/user.model';
import { UserService } from '../../../shared/services/user.service';
import { CommonModule, DatePipe } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  standalone: false,
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
  // imports: [CommonModule]
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadUser(id);
      } else {
        this.error = 'Invalid user ID';
      }
    });
  }

  loadUser(id: any): void {
    this.loading = true;
    this.error = null;

    this.userService.getUser(id).subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
        } else {
          this.error = 'User not found';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.error = 'Failed to load user details. Please try again.';
        this.loading = false;
      }
    });
  }

  editUser(): void {
    if (this.user) {
      this.router.navigate(['/users/edit', this.user._id]);
    }
  }

  deleteUser(): void {
    if (this.user) {
      Swal.fire({
        title: 'Are you sure?',
        text: `Do you really want to delete ${this.user.name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.userService.deleteUser(this.user!._id).subscribe({
            next: (success) => {
              if (success) {
                Swal.fire('Deleted!', 'User has been deleted.', 'success').then(() => {
                  this.router.navigate(['/users']);
                });
              } else {
                this.error = 'Failed to delete user.';
              }
            },
            error: (err) => {
              console.error('Error deleting user:', err);
              this.error = 'Failed to delete user. Please try again.';
            }
          });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}