export interface Vehicle {
  _id: any;
  name: string;
  type: string;
  licensePlate: string;
  status: string; // 'Available', 'On Mission', 'In Maintenance', 'Out of Service'
  fuelType: string;
  registrationNumber:any;
  mileage: number;
  model:string;
  year:any;
  lastMaintenance: Date;
  nextMaintenance: Date;
  purchaseDate: Date;
  assignedTo: number | null; // driver id
  currentMissionId?: number | null; // mission id when vehicle is on mission
}