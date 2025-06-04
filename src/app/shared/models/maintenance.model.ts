export interface Maintenance {
  _id?: string;
  vehicle: any; // Vehicle ObjectId
  maintenanceType: 'preventive' | 'corrective';
  title: string;
  description?: string;
  date: Date;
  nextDueDate?: Date;
  odometerKm: number;
  garageName?: string;
  cost: number;
  status?: 'done' | 'pending' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}
