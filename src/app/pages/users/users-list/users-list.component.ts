import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { User } from '../../../shared/models/user.model';
import { UserService } from '../../../shared/services/user.service';
import Swal from 'sweetalert2';

@Component({
  standalone: false,
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  searchSubject = new Subject<string>();

  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;

  loading = false;
  error: string | null = null;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.searchUsers();
    });

    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        console.log("Users loaded:", users);
        this.filteredUsers = [...users];
        this.totalItems = users.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.error = 'Failed to load users. Please try again.';
        this.loading = false;
      }
    });
  }

  // Fix: always update searchTerm and trigger search immediately
  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.searchUsers();
  }

  searchUsers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = [...this.users];
      this.totalItems = this.users.length;
      return;
    }

    this.userService.searchUsers(this.searchTerm).subscribe({
      next: (users) => {
        this.filteredUsers = users;
        this.totalItems = users.length;
        this.currentPage = 1; // Reset to first page on search
      },
      error: (err) => {
        console.error('Error searching users:', err);
        this.error = 'Failed to search users. Please try again.';
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  viewUser(id: any): void {
    this.router.navigate(['/users', id]);
  }

  editUser(id: any): void {
    console.log("clickeeeed Editing user with ID: ", id);
    this.router.navigate(['/users/edit/', id]);
  }

  deleteUser(id: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this user?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(id).subscribe({
          next: (success) => {
            if (success) {
              this.loadUsers();
              Swal.fire('Deleted!', 'User has been deleted.', 'success');
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

  blockUser(id: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to block this user?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, block user!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.blockUser(id).subscribe({
          next: () => {
            this.loadUsers();
            Swal.fire('Blocked!', 'User has been blocked.', 'success');
          },
          error: (err) => {
            Swal.fire('Error', 'Failed to block user. Please try again.', 'error');
          }
        });
      }
    });
  }

  get paginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  addNewUser(): void {
    this.router.navigate(['/users/new']);
  }
}