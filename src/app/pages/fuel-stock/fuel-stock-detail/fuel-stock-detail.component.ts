import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FuelStockService } from 'src/app/shared/services/fuel-stock.service';
import { FuelStock } from 'src/app/shared/models/fuel-stock.model';

@Component({
  selector: 'app-fuel-stock-detail',
  templateUrl: './fuel-stock-detail.component.html',
  styleUrls: ['./fuel-stock-detail.component.scss'],
   standalone: false
})
export class FuelStockDetailComponent implements OnInit {
  fuelStock: FuelStock | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fuelStockService: FuelStockService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fuelStockService.getById(id).subscribe(stock => {
          this.fuelStock = stock;
          this.loading = false;
        });
      } else {
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/fuel-stock']);
  }
}
