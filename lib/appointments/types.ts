// Shape mirrors GET /leads/dealer/v3/meetings (captured live, see
// brainstorming-flows/projects/appointment-reminder/phasing.md).
// Everything optional/loose on purpose: the API evolves and unknown values
// (esp. `status`) must never break the UI.

export type ServiceType = "sales" | "service";

export interface VehicleData {
  dealerVinId?: string;
  vin?: string;
  make?: string;
  model?: string;
  year?: number | string;
  trim?: string;
  price?: number | string;
}

export interface CustomerData {
  customerId?: string;
  name?: string;
  extractedName?: string;
  emails?: string[];
  mobileNumber?: string;
  customerStatus?: string;
}

export interface Advisor {
  name?: string;
  externalId?: string;
}

export interface AssignedTo {
  userId?: string;
  userName?: string | Record<string, unknown>;
}

export interface MeetingMeta {
  vehicles?: VehicleData[];
  tradeInData?: { tradeRequested?: string; whichTradeInVehicle?: Record<string, unknown> };
  serviceVehicleData?: Record<string, unknown>;
}

export interface Meeting {
  id: string;
  meetingId?: string;
  leadId?: string;
  customerId?: string;
  conversationId?: string;
  serviceType?: string; // "sales" | "service" | future
  status?: string; // scheduled | no_show | ... | future. NEVER switch-exhaustive.
  intent?: string;
  source?: string;
  meetingStartTime?: string;
  meetingEndTime?: string;
  timezone?: string;
  duration?: number;
  tags?: string[];
  servicesRequested?: string[];
  notes?: string[];
  proposedVins?: string[];
  proposedVinsData?: VehicleData[];
  meta?: MeetingMeta;
  advisor?: Advisor;
  assignedTo?: AssignedTo;
  customerData?: CustomerData;
  transportationOption?: string | null;
  externalCrmAppointmentId?: string | null;
  callId?: string;
  createdAt?: string;
  updatedAt?: string;
}
