/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Company, Deal, Quote, Order, Invoice, CylinderBalance, SupportTicket, Campaign, AuditLog, ApprovalRequest, Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'prod-o2', name: 'Oxygen (Industrial Grade)', unit: 'cylinder', bottleSizes: ['Size G (930L)', '47L Cylinder', '15 kg LPG'], stockOnHand: 12540, daysCover: 18.6, reservedStock: 2385, reorderPoint: 800, listPrice: 44.90 },
  { id: 'prod-n2', name: 'Nitrogen (Industrial Grade)', unit: 'cylinder', bottleSizes: ['Size G (930L)', '47L Cylinder'], stockOnHand: 2800, daysCover: 21.3, reservedStock: 650, reorderPoint: 500, listPrice: 18.30 },
  { id: 'prod-ar', name: 'Argon (Industrial Grade)', unit: 'cylinder', bottleSizes: ['Size E (680L)', '47L Cylinder'], stockOnHand: 2150, daysCover: 16.2, reservedStock: 300, reorderPoint: 600, listPrice: 27.60 },
  { id: 'prod-co2', name: 'Carbon Dioxide (Industrial)', unit: 'cylinder', bottleSizes: ['Size F (600L)', '40L Cylinder'], stockOnHand: 2050, daysCover: 13.1, reservedStock: 250, reorderPoint: 500, listPrice: 16.75 },
  { id: 'prod-ac', name: 'Acetylene (Dissolved)', unit: 'cylinder', bottleSizes: ['Size MC (380L)', '10L Cylinder'], stockOnHand: 290, daysCover: 4.5, reservedStock: 60, reorderPoint: 300, listPrice: 35.10 }
];

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp-acme',
    name: 'Acme Manufacturing, LLC',
    customerNumber: 'CUST-100234',
    industry: 'Construction',
    employees: '1,001 - 5,000',
    annualRevenue: '$250M - $500M',
    billingAddress: { address: 'Level 4, 210 George Street', city: 'Sydney', state: 'NSW 2000', country: 'Australia' },
    deliveryAddresses: [
      { id: 'addr-acme-1', name: 'Sydney Site (Default)', address: '1 Construction Way, St Leonards NSW 2065', isDefault: true },
      { id: 'addr-acme-2', name: 'Parramatta Site', address: '45 Junction Street, Parramatta NSW 2150', isDefault: false },
      { id: 'addr-acme-3', name: 'Newcastle Site', address: '12 Steel Street, Mayfield NSW 2304', isDefault: false }
    ],
    creditLimit: 100000,
    availableCredit: 68450,
    paymentTerms: '30 Days End of Month',
    creditStatus: 'Good Standing',
    accountOwner: 'Chris Allen',
    contacts: [
      { id: 'cont-acme-1', name: 'John Doe', role: 'Account Owner', email: 'john.doe@acmeconstruction.com.au', phone: '(02) 9876 5432' },
      { id: 'cont-acme-2', name: 'Jane Smith', role: 'Accounts Payable', email: 'jane.smith@acmeconstruction.com.au', phone: '(02) 9876 5433' },
      { id: 'cont-acme-3', name: 'Mark Wilson', role: 'Site Manager', email: 'mark.wilson@acmeconstruction.com.au', phone: '(02) 9876 5434' }
    ]
  },
  {
    id: 'comp-abc',
    name: 'ABC Engineering Pvt. Ltd.',
    customerNumber: 'CUST-1002547',
    industry: 'Manufacturing',
    employees: '500 - 1,000',
    annualRevenue: '₹500M - ₹1,000M',
    billingAddress: { address: '1234 Main Street', city: 'Colorado Springs', state: 'CO 80903', country: 'USA' },
    deliveryAddresses: [
      { id: 'addr-abc-1', name: 'Main Depot', address: '123 Industrial Way, Houston TX 77032', isDefault: true }
    ],
    creditLimit: 500000, // In local currency or normalized
    availableCredit: 253220,
    paymentTerms: 'Net 30 Days',
    creditStatus: 'On Credit Hold', // Restricted due to overdue invoices
    accountOwner: 'Emily Johnson',
    contacts: [
      { id: 'cont-abc-1', name: 'Ravi Sharma', role: 'Purchasing Manager', email: 'r.sharma@abceng.co.in', phone: '+91 98765 43210' }
    ]
  },
  {
    id: 'comp-boc',
    name: 'BOC Australia Pty Ltd',
    customerNumber: 'CUST-100122',
    industry: 'Key Account / Gas Services',
    employees: '5,000+',
    annualRevenue: '$1B+',
    billingAddress: { address: '100 Pac Highway', city: 'North Sydney', state: 'NSW 2060', country: 'Australia' },
    deliveryAddresses: [
      { id: 'addr-boc-1', name: 'Bhiwandi Plant', address: 'Sector 5, Bhiwandi, Maharashtra', isDefault: true }
    ],
    creditLimit: 250000,
    availableCredit: 132450,
    paymentTerms: '30 Days',
    creditStatus: 'Good Standing',
    accountOwner: 'Mark Reynolds',
    contacts: [
      { id: 'cont-boc-1', name: 'Sarah Johnson', role: 'Operations Lead', email: 's.johnson@boc.com.au', phone: '(02) 8877 6655' }
    ]
  },
  {
    id: 'comp-indus',
    name: 'Indus Metals Ltd.',
    customerNumber: 'CUST-100345',
    industry: 'Metal Fabrication',
    employees: '200 - 500',
    annualRevenue: '$50M - $100M',
    billingAddress: { address: '45 Industrial Area', city: 'Middlesbrough', state: 'TSS 6XX', country: 'UK' },
    deliveryAddresses: [
      { id: 'addr-indus-1', name: 'Middlesbrough Plant 2', address: 'Unit 12, Precision Park, Ashford Road, Middlesbrough', isDefault: true }
    ],
    creditLimit: 150000,
    availableCredit: 112500,
    paymentTerms: '30 Days',
    creditStatus: 'Good Standing',
    accountOwner: 'Emily Johnson',
    contacts: [
      { id: 'cont-indus-1', name: 'Melissa Carter', role: 'Procurement Specialist', email: 'm.carter@indusmetals.co.uk', phone: '+44 1642 555123' }
    ]
  },
  {
    id: 'comp-gulf',
    name: 'Gulf Coast Welding',
    customerNumber: 'CUST-100245',
    industry: 'Shipbuilding / Welding',
    employees: '1,000 - 3,000',
    annualRevenue: '$150M',
    billingAddress: { address: '890 Dockside Road', city: 'Galveston', state: 'TX 77550', country: 'USA' },
    deliveryAddresses: [
      { id: 'addr-gulf-1', name: 'Galveston Shipyard', address: '890 Dockside Road, Galveston TX 77550', isDefault: true }
    ],
    creditLimit: 200000,
    availableCredit: 48732,
    paymentTerms: 'Net 30 Days',
    creditStatus: 'Good Standing',
    accountOwner: 'Chris Allen',
    contacts: [
      { id: 'cont-gulf-1', name: 'Alex Williams', role: 'Finance Manager', email: 'a.williams@gulfcoastwelding.com', phone: '(409) 555-0199' }
    ]
  }
];

export const INITIAL_DEALS: Deal[] = [
  { id: 'deal-1', title: 'Acme Platform Expansion', companyId: 'comp-acme', companyName: 'Acme Manufacturing, LLC', amount: 180000, stage: 'Negotiation', probability: 75, closeDate: '2026-06-30', owner: 'Chris Allen', health: 'Healthy', lastActivity: '2026-07-01' },
  { id: 'deal-2', title: 'Professional Services Package', companyId: 'comp-acme', companyName: 'Acme Manufacturing, LLC', amount: 85000, stage: 'Negotiation', probability: 50, closeDate: '2026-07-15', owner: 'Chris Allen', health: 'At Risk', lastActivity: '2026-06-25' },
  { id: 'deal-3', title: 'Analytics Add-On', companyId: 'comp-acme', companyName: 'Acme Manufacturing, LLC', amount: 47000, stage: 'Qualification', probability: 25, closeDate: '2026-07-31', owner: 'Chris Allen', health: 'Needs Analysis', lastActivity: '2026-07-02' },
  { id: 'deal-4', title: 'Gulf Coast Bulk Oxygen contract', companyId: 'comp-gulf', companyName: 'Gulf Coast Welding', amount: 320000, stage: 'Proposal', probability: 60, closeDate: '2026-08-15', owner: 'Chris Allen', health: 'Healthy', lastActivity: '2026-06-28' },
  { id: 'deal-5', title: 'BOC Specialty Gas Supply v2', companyId: 'comp-boc', companyName: 'BOC Australia Pty Ltd', amount: 450000, stage: 'Negotiation', probability: 80, closeDate: '2026-07-20', owner: 'Mark Reynolds', health: 'Healthy', lastActivity: '2026-07-03' }
];

export const INITIAL_QUOTES: Quote[] = [
  {
    id: 'quote-1',
    quoteNumber: 'Q-10234',
    dealId: 'deal-1',
    companyName: 'Acme Manufacturing, LLC',
    validUntil: '2026-07-30',
    items: [
      { id: 'qi-1', productName: 'Oxygen (Industrial Grade)', gasType: 'OXYGEN', bottleSize: 'Size G (930L)', quantity: 10, unitPrice: 38.50, listPrice: 44.90 },
      { id: 'qi-2', productName: 'Nitrogen (Industrial Grade)', gasType: 'NITROGEN', bottleSize: 'Size G (930L)', quantity: 5, unitPrice: 16.50, listPrice: 18.30 }
    ],
    discount: 14.2, // ~14% discount
    subtotal: 540.50, // per order/delivery mock
    discountAmount: 76.75,
    total: 463.75,
    margin: 18.2, // percentage gross margin
    status: 'Sent to Customer',
    requestedBy: 'Chris Allen'
  },
  {
    id: 'quote-2',
    quoteNumber: 'Q-10221',
    dealId: 'deal-4',
    companyName: 'Gulf Coast Welding',
    validUntil: '2026-07-25',
    items: [
      { id: 'qi-3', productName: 'Oxygen (Industrial Grade)', gasType: 'OXYGEN', bottleSize: '47L Cylinder', quantity: 50, unitPrice: 35.00, listPrice: 44.90 }
    ],
    discount: 22.0, // Exceeds policy (>15%)
    subtotal: 2245.00,
    discountAmount: 493.90,
    total: 1751.10,
    margin: 11.5, // low margin!
    status: 'Pending Approval', // Triggers Management Approval request M17
    approverNeeded: 'Manager / leadership',
    requestedBy: 'Chris Allen'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1024',
    orderNumber: 'ORD-250520-1024',
    companyId: 'comp-indus',
    companyName: 'Indus Metals Ltd.',
    poNumber: 'PO-77841',
    date: '2026-07-02',
    deliveryDate: '2026-07-04',
    deliveryType: 'Delivery',
    deliveryAddress: 'Unit 12, Precision Park, Ashford Road, Middlesbrough',
    items: [
      { productName: 'Oxygen (Industrial Grade)', bottleSize: 'Size G (930L)', quantity: 10, unitPrice: 38.50, subtotal: 385.00 },
      { productName: 'Oxygen (Industrial Grade)', bottleSize: '47L Cylinder', quantity: 30, unitPrice: 22.00, subtotal: 660.00 },
      { productName: 'Acetylene (Dissolved)', bottleSize: 'Size MC (380L)', quantity: 15, unitPrice: 35.10, subtotal: 526.50 }
    ],
    status: 'Approved',
    creditHoldTriggered: false,
    assignedDriver: 'John Carter',
    eta: '2026-07-04 10:30 AM',
    stopNumber: 3,
    totalStops: 12,
    total: 1571.50,
    vat: 314.30,
    grandTotal: 1885.80
  },
  {
    id: 'ord-1023',
    orderNumber: 'ORD-250520-1023',
    companyId: 'comp-abc',
    companyName: 'ABC Engineering Pvt. Ltd.',
    poNumber: 'PO-98112',
    date: '2026-07-01',
    deliveryDate: '2026-07-03',
    deliveryType: 'Delivery',
    deliveryAddress: '123 Industrial Way, Houston TX 77032',
    items: [
      { productName: 'Nitrogen (Industrial Grade)', bottleSize: '47L Cylinder', quantity: 30, unitPrice: 18.30, subtotal: 549.00 }
    ],
    status: 'New',
    creditHoldTriggered: true, // Triggered! Since ABC Engineering is on "On Credit Hold" status
    assignedDriver: 'Sarah Thompson',
    total: 549.00,
    vat: 109.80,
    grandTotal: 658.80
  },
  {
    id: 'ord-1022',
    orderNumber: 'ORD-250520-1022',
    companyId: 'comp-acme',
    companyName: 'Acme Manufacturing, LLC',
    poNumber: 'PO-24410',
    date: '2026-07-03',
    deliveryDate: '2026-07-05',
    deliveryType: 'Delivery',
    deliveryAddress: '1 Construction Way, St Leonards NSW 2065',
    items: [
      { productName: 'Oxygen (Industrial Grade)', bottleSize: 'Size G (930L)', quantity: 5, unitPrice: 44.90, subtotal: 224.50 },
      { productName: 'Nitrogen (Industrial Grade)', bottleSize: 'Size G (930L)', quantity: 3, unitPrice: 18.30, subtotal: 54.90 }
    ],
    status: 'New',
    creditHoldTriggered: false,
    assignedDriver: 'Unassigned',
    total: 279.40,
    vat: 55.88,
    grandTotal: 335.28
  },
  {
    id: 'ord-1019',
    orderNumber: 'ORD-250519-1019',
    companyId: 'comp-acme',
    companyName: 'Acme Manufacturing, LLC',
    poNumber: 'PO-24322',
    date: '2026-06-25',
    deliveryDate: '2026-06-27',
    deliveryType: 'Delivery',
    deliveryAddress: '1 Construction Way, St Leonards NSW 2065',
    items: [
      { productName: 'Argon (Industrial Grade)', bottleSize: 'Size E (680L)', quantity: 12, unitPrice: 27.60, subtotal: 331.20 }
    ],
    status: 'Delivered',
    creditHoldTriggered: false,
    assignedDriver: 'John Carter',
    eta: '2026-06-27 02:15 PM',
    total: 331.20,
    vat: 66.24,
    grandTotal: 397.44
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  { id: 'inv-1', invoiceNumber: 'INV-2026-1458', orderNumber: 'ORD-250519-1019', companyId: 'comp-acme', companyName: 'Acme Manufacturing, LLC', dueDate: '2026-07-27', amount: 397.44, status: 'CURRENT' },
  { id: 'inv-2', invoiceNumber: 'INV-2026-1322', orderNumber: 'ORD-250520-1024', companyId: 'comp-indus', companyName: 'Indus Metals Ltd.', dueDate: '2026-08-04', amount: 1885.80, status: 'CURRENT' },
  { id: 'inv-3', invoiceNumber: 'INV-2026-1120', orderNumber: 'ORD-250520-1023', companyId: 'comp-abc', companyName: 'ABC Engineering Pvt. Ltd.', dueDate: '2026-06-15', amount: 1248.75, status: 'OVERDUE' }, // unpaid historical invoice putting ABC on credit hold
  { id: 'inv-4', invoiceNumber: 'INV-2026-1055', orderNumber: 'ORD-250519-0901', companyId: 'comp-gulf', companyName: 'Gulf Coast Welding', dueDate: '2026-06-10', amount: 312.47, status: 'OVERDUE' }
];

export const INITIAL_CYLINDERS: CylinderBalance[] = [
  { companyId: 'comp-acme', gasType: 'OXYGEN', bottleSize: 'Size G (930L)', fullOnSite: 244, emptyOnSite: 92, inTransit: 6, overdueReturns: 23, riskLevel: 'High' },
  { companyId: 'comp-acme', gasType: 'NITROGEN', bottleSize: 'Size G (930L)', fullOnSite: 310, emptyOnSite: 120, inTransit: 8, overdueReturns: 28, riskLevel: 'High' },
  { companyId: 'comp-abc', gasType: 'OXYGEN', bottleSize: 'Size G (930L)', fullOnSite: 152, emptyOnSite: 64, inTransit: 4, overdueReturns: 12, riskLevel: 'Medium' },
  { companyId: 'comp-boc', gasType: 'NITROGEN', bottleSize: '47L Cylinder', fullOnSite: 210, emptyOnSite: 78, inTransit: 6, overdueReturns: 15, riskLevel: 'Medium' },
  { companyId: 'comp-indus', gasType: 'ARGON', bottleSize: 'Size E (680L)', fullOnSite: 80, emptyOnSite: 30, inTransit: 2, overdueReturns: 7, riskLevel: 'Medium' }
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-1',
    ticketNumber: 'TKT-20260521-1001',
    companyId: 'comp-acme',
    companyName: 'Acme Manufacturing, LLC',
    requestType: 'Delivery Issue',
    orderReference: 'ORD-250520-1022',
    cylinderType: 'Oxygen (Industrial Grade)',
    createdOn: '2026-07-02 09:15 AM',
    status: 'In Progress',
    priority: 'Medium',
    description: 'We requested urgent delivery for our Sydney shipyard project, but the status is still showing New. Can we expedite?',
    replies: [
      { sender: 'Customer', senderName: 'Mark Wilson', message: 'Hi support team, is there any update on this delivery?', timestamp: '2026-07-02 09:15 AM' },
      { sender: 'Support Agent', senderName: 'Alex Carter', message: 'Hi Mark, we are assigning a driver for the delivery on July 5th. It should update shortly.', timestamp: '2026-07-02 11:30 AM' }
    ]
  },
  {
    id: 'tkt-2',
    ticketNumber: 'TKT-20260520-0987',
    companyId: 'comp-abc',
    companyName: 'ABC Engineering Pvt. Ltd.',
    requestType: 'Missing Cylinder',
    cylinderType: 'Carbon Dioxide',
    createdOn: '2026-07-01 10:45 AM',
    status: 'Open',
    priority: 'High',
    description: 'We had a collection of 5 empty cylinders, but 2 are missing from the transaction slip.',
    replies: [
      { sender: 'Customer', senderName: 'Ravi Sharma', message: 'Please audit the return logs from June 28th.', timestamp: '2026-07-01 10:45 AM' }
    ]
  },
  {
    id: 'tkt-3',
    ticketNumber: 'TKT-20260519-0765',
    companyId: 'comp-indus',
    companyName: 'Indus Metals Ltd.',
    requestType: 'Damaged Cylinder',
    cylinderType: 'Acetylene (Dissolved)',
    createdOn: '2026-06-30 11:08 AM',
    status: 'Resolved',
    priority: 'Medium',
    description: 'One cylinder delivered has a faulty valve handle. We have put it aside.',
    replies: [
      { sender: 'Customer', senderName: 'Melissa Carter', message: 'Valve handle is bent and unsafe to open.', timestamp: '2026-06-30 11:08 AM' },
      { sender: 'Support Agent', senderName: 'Alex Carter', message: 'Understood. We will send a replacement and collect the damaged one during the next scheduled route on July 4th.', timestamp: '2026-06-30 02:15 PM' }
    ]
  },
  {
    id: 'tkt-4',
    ticketNumber: 'TKT-20260518-0654',
    companyId: 'comp-gulf',
    companyName: 'Gulf Coast Welding',
    requestType: 'Invoice Query',
    orderReference: 'ORD-250519-0901',
    createdOn: '2026-06-29 04:22 PM',
    status: 'Resolved',
    priority: 'Low',
    description: 'The discount of 12% is not reflected on Invoice INV-2026-1055.',
    replies: [
      { sender: 'Customer', senderName: 'Alex Williams', message: 'Please correct the billing amount.', timestamp: '2026-06-29 04:22 PM' },
      { sender: 'Support Agent', senderName: 'Alex Carter', message: 'Apologies for the oversight. We have credited the difference and updated the outstanding amount to $312.47.', timestamp: '2026-06-30 09:40 AM' }
    ]
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  { id: 'camp-1', name: 'Summer Industrial Launch', channel: 'Instagram, Facebook, Email', objective: 'Drive awareness & bulk orders', spend: 28340, revenue: 119028, roi: 320, leads: 1248, mqls: 342, cac: 22.71, status: 'Active' },
  { id: 'camp-2', name: 'Specialty Gas Focus', channel: 'LinkedIn, Google Search', objective: 'Lead generation for medical oxygen', spend: 21120, revenue: 65450, roi: 210, leads: 540, mqls: 180, cac: 39.11, status: 'Active' },
  { id: 'camp-3', name: 'Reactivation Campaign Q2', channel: 'SMS, Direct Sales Outreach', objective: 'Reactivate dormant metal fabrication accounts', spend: 12500, revenue: 58000, roi: 364, leads: 220, mqls: 154, cac: 56.82, status: 'Completed' }
];

export const INITIAL_APPROVALS: ApprovalRequest[] = [
  {
    id: 'appr-1',
    type: 'Discount',
    referenceId: 'quote-2',
    customerName: 'Gulf Coast Welding',
    details: 'Discount Request for 50 Oxygen cylinders: 22.0% requested. Policy threshold is 15.0%. Margin drops to 11.5% below minimum 32.2%.',
    impactValue: '-$493.90 Margin Impact',
    requestedBy: 'Chris Allen',
    requestDate: '2026-07-03',
    slaDays: 1,
    status: 'Pending',
    auditTrail: [
      { action: 'Discount Request Submitted', user: 'Chris Allen', timestamp: '2026-07-03 10:15 AM' }
    ]
  },
  {
    id: 'appr-2',
    type: 'Credit Hold',
    referenceId: 'ord-1023',
    customerName: 'ABC Engineering Pvt. Ltd.',
    details: 'Order ORD-250520-1023 is blocked due to Credit Hold. ABC has 1 overdue invoice of ₹1,24,875 exceeding 30-day grace.',
    impactValue: 'Order Release Needed (Value: ₹65,880)',
    requestedBy: 'Emily Johnson',
    requestDate: '2026-07-01',
    slaDays: 2,
    status: 'Pending',
    auditTrail: [
      { action: 'Credit Block Enforced', user: 'System Automation', timestamp: '2026-07-01 08:30 AM' },
      { action: 'Requested Executive Release Override', user: 'Emily Johnson', timestamp: '2026-07-01 10:12 AM' }
    ]
  },
  {
    id: 'appr-3',
    type: 'User Access',
    referenceId: 'access-123',
    customerName: 'Indus Metals Ltd.',
    details: 'Melissa Carter requests full Buyer role access + Spending limit increase from $10,000 to $25,000 for purchasing agent David Wilson.',
    impactValue: 'Role Elevation Approval',
    requestedBy: 'Melissa Carter (Customer Admin)',
    requestDate: '2026-07-02',
    slaDays: 3,
    status: 'Pending',
    auditTrail: [
      { action: 'Elevated Access Requested', user: 'Melissa Carter', timestamp: '2026-07-02 11:42 AM' }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', timestamp: '2026-07-03 10:15 AM', user: 'Chris Allen', action: 'Price Discount Submitted', entityType: 'Quote', entityName: 'Quote Q-10221', platform: 'S&M', ipAddress: '203.0.113.45', details: 'Submitted 22% discount for Gulf Coast Welding (requires approval)' },
  { id: 'log-2', timestamp: '2026-07-03 09:42 AM', user: 'John Doe', action: 'Customer Order Submitted', entityType: 'Order', entityName: 'Order ORD-250520-1022', platform: 'Customer', ipAddress: '192.0.2.56', details: 'Placed order via Portal. Credit status check OK. Status: Approved' },
  { id: 'log-3', timestamp: '2026-07-02 11:08 AM', user: 'Melissa Carter', action: 'Support Ticket Raised', entityType: 'Customer', entityName: 'Ticket TKT-20260519-0765', platform: 'Customer', ipAddress: '198.51.100.23', details: 'Raised High priority ticket for Damaged Cylinder' },
  { id: 'log-4', timestamp: '2026-07-01 08:30 AM', user: 'System Automation', action: 'Credit Hold Applied', entityType: 'Invoice', entityName: 'Invoice INV-2026-1120', platform: 'Shared', ipAddress: '203.0.113.78', details: 'Auto-applied On Credit Hold status to ABC Engineering due to aged debt >30 days' },
  { id: 'log-5', timestamp: '2026-06-30 02:15 PM', user: 'Alex Carter', action: 'Support Ticket Resolved', entityType: 'Customer', entityName: 'Ticket TKT-20260519-0765', platform: 'S&M', ipAddress: '203.0.113.45', details: 'Resolved bent valve handle ticket. Replacement scheduled' }
];
