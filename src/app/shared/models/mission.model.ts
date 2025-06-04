export interface Mission {
  _id: any;
  title: string;
  description?: string;
  cancelReason?: string;
  iscancelReasonAccepted?: boolean;
  iscancelReasonRejected?: boolean;
  status: string; // 'Planned', 'In Progress', 'Completed', 'Cancelled'
  priority: string; // 'Low', 'Medium', 'High'
  startDate: Date;
  endDate: Date | null;
  startLocation: string;
  destination: string;
  vehicle?: any | null;
  driver?: any | null;
  notes?: string;
  createdDate?: Date;
}




 
