/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Company {
  id: string;
  name: string;
  customerNumber: string;
  industry: string;
  employees: string;
  annualRevenue: string;
  billingAddress: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  deliveryAddresses: Array<{
    id: string;
    name: string;
    address: string;
    isDefault: boolean;
  }>;
  creditLimit: number;
  availableCredit: number;
  paymentTerms: string;
  creditStatus: 'Good Standing' | 'On Credit Hold' | 'Pending Review';
  accountOwner: string;
  contacts: Contact[];
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface Deal {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  amount: number;
  stage: 'Prospecting' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won';
  probability: number; // percentage
  closeDate: string;
  owner: string;
  health: 'Healthy' | 'At Risk' | 'Needs Analysis';
  lastActivity: string;
  notes?: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  dealId: string;
  companyName: string;
  validUntil: string;
  items: QuoteItem[];
  discount: number; // percentage
  subtotal: number;
  discountAmount: number;
  total: number;
  margin: number; // percentage
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Sent to Customer';
  approverNeeded?: string;
  requestedBy: string;
}

export interface QuoteItem {
  id: string;
  productName: string;
  gasType: string;
  bottleSize: string;
  quantity: number;
  unitPrice: number;
  listPrice: number;
}

export interface Product {
  id: string;
  name: string;
  unit: string;
  bottleSizes: string[];
  stockOnHand: number;
  daysCover: number;
  reservedStock: number;
  reorderPoint: number;
  listPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  companyId: string;
  companyName: string;
  poNumber: string;
  date: string;
  deliveryDate: string;
  deliveryType: 'Delivery' | 'Collection';
  deliveryAddress: string;
  items: OrderItem[];
  status: 'New' | 'Approved' | 'Picking' | 'Loaded' | 'Out for Delivery' | 'Delivered' | 'Invoiced' | 'Invoiced & Paid';
  creditHoldTriggered: boolean;
  assignedDriver?: string;
  eta?: string;
  stopNumber?: number;
  totalStops?: number;
  total: number;
  vat: number;
  grandTotal: number;
}

export interface OrderItem {
  productName: string;
  bottleSize: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  companyId: string;
  companyName: string;
  dueDate: string;
  amount: number;
  status: 'CURRENT' | 'OVERDUE' | 'PAID';
  pdfUrl?: string;
}

export interface CylinderBalance {
  companyId: string;
  gasType: string;
  bottleSize: string;
  fullOnSite: number;
  emptyOnSite: number;
  inTransit: number;
  overdueReturns: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  companyId: string;
  companyName: string;
  requestType: 'Delivery Issue' | 'Missing Cylinder' | 'Damaged Cylinder' | 'Invoice Query' | 'Special Request';
  orderReference?: string;
  cylinderType?: string;
  createdOn: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
  description: string;
  replies: Array<{
    sender: 'Customer' | 'Support Agent';
    senderName: string;
    message: string;
    timestamp: string;
  }>;
}

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  objective: string;
  spend: number;
  revenue: number;
  roi: number; // percentage
  leads: number;
  mqls: number;
  cac: number;
  status: 'Draft' | 'Active' | 'Approved' | 'Completed';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entityType: 'Order' | 'Quote' | 'Invoice' | 'Cylinder' | 'Customer' | 'Payment' | 'Permission';
  entityName: string;
  platform: 'Customer' | 'S&M' | 'Management' | 'Shared';
  ipAddress: string;
  details?: string;
  beforeValue?: string;
  afterValue?: string;
}

export interface ApprovalRequest {
  id: string;
  type: 'Discount' | 'Credit Hold' | 'Order Release' | 'User Access';
  referenceId: string;
  customerName: string;
  details: string;
  impactValue: string;
  requestedBy: string;
  requestDate: string;
  slaDays: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  auditTrail: Array<{
    action: string;
    user: string;
    timestamp: string;
  }>;
}

export type PlatformType = 'S&M' | 'Management' | 'Customer' | 'Roadmap';

export type UserRole =
  | 'Sales rep'
  | 'Marketing user'
  | 'Manager / leadership'
  | 'Finance manager'
  | 'Operations manager'
  | 'Customer company admin'
  | 'Customer buyer'
  | 'Customer finance contact'
  | 'Customer operations contact'
  | 'Customer viewer-only user';
