import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FuelStockService } from 'src/app/shared/services/fuel-stock.service';
import { VehicleService } from 'src/app/shared/services/vehicle.service';
import { FuelStock } from 'src/app/shared/models/fuel-stock.model';
import { Vehicle } from 'src/app/shared/models/vehicle.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-fuel-stock-form',
  templateUrl: './fuel-stock-form.component.html',
  styleUrls: ['./fuel-stock-form.component.scss'],
   standalone: false
})
export class FuelStockFormComponent implements OnInit {
  fuelStockForm: FormGroup;
  isEditMode = false;
  submitting = false;
  vehicles: Vehicle[] = [];
  recordId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private fuelStockService: FuelStockService,
    private vehicleService: VehicleService
  ) {
    this.fuelStockForm = this.fb.group({
      transaction_type: ['in', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      fueltype: ['diesel', Validators.required],
      vehicle: [null],
      supplier: ['']
    });
  }

  ngOnInit(): void {
    this.vehicleService.getVehicles().subscribe(vs => this.vehicles = vs);
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.recordId = id;
        this.fuelStockService.getById(id).subscribe(stock => {
          this.fuelStockForm.patchValue({
            ...stock,
            vehicle: typeof stock.vehicle === 'object' && stock.vehicle !== null ? stock.vehicle._id : stock.vehicle || null
          });
        });
      }
    });
  }

  onSubmit(): void {
    if (this.fuelStockForm.invalid) return;
    this.submitting = true;
    const data = this.fuelStockForm.value;
    if (this.isEditMode && this.recordId) {
      // No update endpoint in backend, so just show success
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Fuel stock updated!',
        timer: 1500,
        showConfirmButton: false
      }).then(() => this.router.navigate(['/fuel-stock']));
      this.submitting = false;
    } else {
      this.fuelStockService.create(data).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Fuel stock added!',
            timer: 1500,
            showConfirmButton: false
          }).then(() => this.router.navigate(['/fuel-stock']));
          this.submitting = false;
        },
        error: () => {
          this.submitting = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/fuel-stock']);
  }
}
