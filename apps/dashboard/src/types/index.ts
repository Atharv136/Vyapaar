export interface Tenant {
  id: string;
  businessName: string;
  wabaId: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  plan: 'starter' | 'growth' | 'business';
  status: 'active' | 'suspended';
  currency: string;
  modes: ('commerce' | 'lead')[];
  deliveryChargePaise: number;
  freeDeliveryThresholdPaise: number;
  aiTone: 'friendly_kirana' | 'formal_business' | 'direct_concise';
  razorpayKeyId: string;
  webhookStatus: 'connected' | 'degraded' | 'disconnected';
}

export interface Customer {
  id: string;
  tenantId: string;
  waId: string; // WhatsApp phone e.g. "+91 98201 44521"
  name: string;
  consentMarketing: boolean;
  totalOrders: number;
  totalSpendPaise: number;
  lastActiveAt: string;
  usualItems: {
    productId: string;
    productName: string;
    quantity: number;
    unitPricePaise: number;
    orderCount: number;
  }[];
  wishlist: {
    productId: string;
    productName: string;
    pricePaise: number;
    inStock: boolean;
    addedAt: string;
  }[];
}

export type MessageType = 'text' | 'audio' | 'image' | 'interactive_cart' | 'interactive_flow' | 'payment_link';
export type MessageSender = 'customer' | 'ai' | 'merchant' | 'system';

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: MessageSender;
  type: MessageType;
  content: string;
  timestamp: string;
  mediaUrl?: string;
  audioDurationSec?: number;
  transcript?: string;
  confidence?: number;
  ocrLines?: { text: string; confidence: number; matchedSku?: string }[];
  cartData?: {
    items: {
      productId: string;
      name: string;
      variant: string;
      quantity: number;
      pricePaise: number;
    }[];
    subtotalPaise: number;
    deliveryFeePaise: number;
    totalPaise: number;
    confirmed: boolean;
  };
  paymentData?: {
    amountPaise: number;
    paymentLinkId: string;
    status: 'pending' | 'paid' | 'failed' | 'expired';
    method?: string;
  };
}

export interface Conversation {
  id: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  mode: 'ai' | 'human'; // V-ESC-01: human mode silences AI
  status: 'active' | 'escalated' | 'resolved' | 'abandoned';
  lastCustomerMessageAt: string;
  unreadCount: number;
  lastMessageSnippet: string;
  escalationReason?: string;
  aiSummary?: string;
  suggestedReply?: string;
  vertical: 'kirana' | 'restaurant' | 'd2c' | 'pharmacy' | 'leads';
  messages: ChatMessage[];
}

export type OrderStatus = 
  | 'pending_payment'
  | 'paid'
  | 'pending_dispatch_confirmation'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'upi_link' | 'whatsapp_pay' | 'razorpay' | 'cod';

export interface OrderItem {
  productId: string;
  name: string;
  variant: string;
  quantity: number;
  unitPricePaise: number;
  totalPaise: number;
}

export interface RTORiskAssessment {
  score: number; // 0 to 100
  band: 'Low' | 'Medium' | 'High';
  factors: {
    factor: string;
    impact: 'positive' | 'warning' | 'danger';
    detail: string;
  }[];
  recommendation: string;
  label: 'Illustrative heuristic (Phase 11)';
}

export interface Order {
  id: string;
  orderNumber: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: {
    street: string;
    area: string;
    pincode: string;
    landmark?: string;
  };
  items: OrderItem[];
  subtotalPaise: number;
  taxPaise: number;
  deliveryFeePaise: number;
  totalPaise: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  dispatchedAt?: string;
  trackingNumber?: string;
  riskAssessment: RTORiskAssessment;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  pricePaise: number; // Stored in integer paise
  unit: string;
  onHand: number;
  reserved: number; // Reserved stock locks double-selling
  lowStockThreshold: number;
  imageUrl?: string;
  brand?: string;
  inStock: boolean;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  requirement: string;
  budgetRange: string;
  timeline: string;
  status: 'new' | 'qualifying' | 'qualified' | 'appointment_booked' | 'converted' | 'lost';
  bookedSlot?: {
    date: string;
    time: string;
    calendarEventId: string;
  };
  followUpStep: string;
  stopFollowUp: boolean;
  createdAt: string;
}

