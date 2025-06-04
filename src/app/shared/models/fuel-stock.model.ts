import { Vehicle } from './vehicle.model';

export interface FuelStock {
  _id?: string;
  date: Date | string;
  transaction_type: 'in' | 'out';
  quantity: number;
  fueltype: 'diesel' | 'gasoline';
  vehicle?: any;
  supplier?: string;
}
