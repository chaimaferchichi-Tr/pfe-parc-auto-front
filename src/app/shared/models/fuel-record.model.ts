export interface FuelRecord {
  _id: any;
  mission: any;
  fuelType: 'ticket' | 'card';
  quantity: number;
  cost: number;
  date?: Date;
    station: string;
    location: string;

}


