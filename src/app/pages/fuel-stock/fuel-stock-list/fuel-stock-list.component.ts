import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FuelStock } from 'src/app/shared/models/fuel-stock.model';
import { FuelStockService } from 'src/app/shared/services/fuel-stock.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-fuel-stock-list',
  templateUrl: './fuel-stock-list.component.html',
  styleUrls: ['./fuel-stock-list.component.scss'],
  standalone: false,
})
export class FuelStockListComponent implements OnInit {
  fuelStocks: FuelStock[] = [];
  filteredFuelStocks: FuelStock[] = [];
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;
  loading = true;

  constructor(private fuelStockService: FuelStockService, private router: Router) {}

  ngOnInit(): void {
    this.loadFuelStocks();
  }

  loadFuelStocks(): void {
    this.loading = true;
    this.fuelStockService.getAll().subscribe({
      next: (stocks) => {
        this.fuelStocks = stocks;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.fuelStocks];
    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(stock =>
        (stock.date && new Date(stock.date).toLocaleDateString().includes(term)) ||
        (stock.transaction_type && stock.transaction_type.toLowerCase().includes(term)) ||
        (stock.quantity && stock.quantity.toString().includes(term)) ||
        (stock.fueltype && stock.fueltype.toLowerCase().includes(term)) ||
        (stock.vehicle && (typeof stock.vehicle === 'string' ? stock.vehicle.toLowerCase().includes(term) : stock.vehicle.name?.toLowerCase().includes(term))) ||
        (stock.supplier && stock.supplier.toLowerCase().includes(term))
      );
    }
    this.filteredFuelStocks = result;
    this.totalItems = result.length;
    this.currentPage = 1;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  get paginatedFuelStocks(): FuelStock[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredFuelStocks.slice(startIndex, startIndex + this.itemsPerPage);
  }

  addFuelStock(): void {
    this.router.navigate(['/fuel-stock/new']);
  }

  viewFuelStock(id: string): void {
    this.router.navigate(['/fuel-stock', id]);
  }

  editFuelStock(id: string): void {
    this.router.navigate(['/fuel-stock/edit', id]);
  }

  deleteFuelStock(id: string, event: Event): void {
    event.stopPropagation();
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.fuelStockService.delete(id).subscribe(() => {
          Swal.fire('Deleted!', 'Fuel stock record has been deleted.', 'success');
          this.loadFuelStocks();
        });
      }
    });
  }
}
