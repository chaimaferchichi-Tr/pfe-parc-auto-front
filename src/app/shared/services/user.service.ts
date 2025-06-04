import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: User[] = [];

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    // Fetch users from backend API
    return this.http.get<User[]>('https://backend-parc.onrender.com/User/all');
  }

  getUser(id: any): Observable<User | undefined> {
    // Fetch user from backend API
    return this.http.get<User>(`https://backend-parc.onrender.com/User/getbyid/${id}`);
  }

  // Fix: always search in-memory if users are loaded, otherwise fallback to backend
  searchUsers(searchTerm: string): Observable<User[]> {
    const term = searchTerm.toLowerCase();
    if (this.users && this.users.length > 0) {
      const filteredUsers = this.users.filter(user =>
        (user.name && user.name.toLowerCase().includes(term)) ||
        (user.lastname && user.lastname.toLowerCase().includes(term)) ||
        (user.email && user.email.toLowerCase().includes(term)) ||
        (user.role && user.role.toLowerCase().includes(term)) ||
        (user.statuts_account && user.statuts_account.toLowerCase().includes(term))
      );
      return of(filteredUsers);
    } else {
      // fallback: fetch all users and filter
      return new Observable<User[]>(observer => {
        this.getUsers().subscribe(users => {
          this.users = users;
          const filteredUsers = users.filter(user =>
            (user.name && user.name.toLowerCase().includes(term)) ||
            (user.lastname && user.lastname.toLowerCase().includes(term)) ||
            (user.email && user.email.toLowerCase().includes(term)) ||
            (user.role && user.role.toLowerCase().includes(term)) ||
            (user.statuts_account && user.statuts_account.toLowerCase().includes(term))
          );
          observer.next(filteredUsers);
          observer.complete();
        });
      });
    }
  }

  addUser(user: Omit<User, '_id' | 'createdAt' | 'updatedAt' | '__v'>): Observable<User> {
    // POST to backend API
    return this.http.post<User>(
      'https://backend-parc.onrender.com/User/register', user
    );
  }

  updateUser(user: User): Observable<User> {
    // Call backend API to update user
    return this.http.put<User>(
      `https://backend-parc.onrender.com/User/update/${user._id}`, user
    );
  }

  deleteUser(id: string): Observable<boolean> {
    // Call backend API to delete user
    return this.http.delete<boolean>(
      `https://backend-parc.onrender.com/User/delete/${id}`
    );
  }

  setDriverAccountActive(userId: string): Observable<User> {
    return this.http.put<User>(
      `https://backend-parc.onrender.com/User/activate-driver/${userId}`, {}
    );
  }

  blockUser(userId: string): Observable<User> {
    return this.http.put<User>(
      `https://backend-parc.onrender.com/User/blockuser/${userId}`, {}
    );
  }
}