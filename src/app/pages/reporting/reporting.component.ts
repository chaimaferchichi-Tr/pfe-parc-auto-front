import { Component } from '@angular/core';

@Component({
  standalone: false, // <-- ensure not standalone
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.scss']
})
export class ReportingComponent {
  selectedReport: string = 'fuel-vehicle';

  reportTypes = [
    { key: 'fuel-vehicle', label: 'Fuel Consumption by Vehicle' },
    { key: 'fuel-driver', label: 'Fuel Consumption by Driver' },
    { key: 'fuel-mission', label: 'Fuel Consumption by Mission' }
  ];

  selectReport(key: string) {
    this.selectedReport = key;
  }
}
