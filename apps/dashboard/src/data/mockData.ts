import { Tenant, Customer, Conversation, Order, Product, Lead } from '../types';

export const mockTenants: Tenant[] = [
  {
    id: 't-freshbasket-001',
    businessName: 'FreshBasket Kirana & Mart',
    wabaId: 'waba_992104829103',
    phoneNumberId: 'phone_id_8812903',
    displayPhoneNumber: '+91 98200 12345',
    plan: 'growth',
    status: 'active',
    currency: 'INR',
    modes: ['commerce', 'lead'],
    deliveryChargePaise: 4000, // ₹40
    freeDeliveryThresholdPaise: 50000, // ₹500
    aiTone: 'friendly_kirana',
    razorpayKeyId: 'rzp_test_9Hjk8aLq23Z',
    webhookStatus: 'connected'
  },
  {
    id: 't-apexelectronics-002',
    businessName: 'Apex Home & Electronics',
    wabaId: 'waba_448192837190',
    phoneNumberId: 'phone_id_6619284',
    displayPhoneNumber: '+91 98450 99887',
    plan: 'business',
    status: 'active',
    currency: 'INR',
    modes: ['commerce'],
    deliveryChargePaise: 0,
    freeDeliveryThresholdPaise: 100000,
    aiTone: 'formal_business',
    razorpayKeyId: 'rzp_test_4Bmm19Px88Q',
    webhookStatus: 'connected'
  }
];

export const mockProducts: Product[] = [
  {
    id: 'p-101',
    sku: 'MILK-AMUL-500',
    name: 'Amul Taaza Toned Milk',
    category: 'Dairy & Eggs',
    description: 'Pasteurized homogenized toned milk, 3.0% fat min, 8.5% SNF min.',
    pricePaise: 2800, // ₹28.00
    unit: '500 ml pouch',
    onHand: 48,
    reserved: 6,
    lowStockThreshold: 15,
    brand: 'Amul',
    inStock: true
  },
  {
    id: 'p-102',
    sku: 'MILK-AMUL-1L',
    name: 'Amul Taaza Toned Milk (1 Litre)',
    category: 'Dairy & Eggs',
    description: 'Pasteurized homogenized toned milk, 1 Litre carton pouch.',
    pricePaise: 5600, // ₹56.00
    unit: '1 Litre',
    onHand: 32,
    reserved: 4,
    lowStockThreshold: 10,
    brand: 'Amul',
    inStock: true
  },
  {
    id: 'p-103',
    sku: 'BREAD-WHEAT-400',
    name: 'English Oven Whole Wheat Bread',
    category: 'Bakery & Bread',
    description: '100% whole wheat sliced loaf, zero maida, no added preservatives.',
    pricePaise: 4500, // ₹45.00
    unit: '400g pack',
    onHand: 24,
    reserved: 3,
    lowStockThreshold: 8,
    brand: 'English Oven',
    inStock: true
  },
  {
    id: 'p-104',
    sku: 'SALT-TATA-1KG',
    name: 'Tata Iodized Vacuum Evaporated Salt',
    category: 'Pantry Staples',
    description: 'Pure vacuum evaporated iodized salt for daily cooking.',
    pricePaise: 2800, // ₹28.00
    unit: '1 kg packet',
    onHand: 60,
    reserved: 2,
    lowStockThreshold: 12,
    brand: 'Tata',
    inStock: true
  },
  {
    id: 'p-105',
    sku: 'COFFEE-BRU-100G',
    name: 'Bru Instant Coffee Powder',
    category: 'Beverages',
    description: 'Roasted coffee and chicory blend for strong aromatic filter coffee.',
    pricePaise: 21500, // ₹215.00
    unit: '100g glass jar',
    onHand: 18,
    reserved: 2,
    lowStockThreshold: 5,
    brand: 'Bru',
    inStock: true
  },
  {
    id: 'p-106',
    sku: 'ATTA-AASH-5KG',
    name: 'Aashirvaad Shudh Chakki Atta',
    category: 'Pantry Staples',
    description: '100% whole wheat chakki ground atta, natural dietary fiber.',
    pricePaise: 26500, // ₹265.00
    unit: '5 kg bag',
    onHand: 14,
    reserved: 4,
    lowStockThreshold: 6,
    brand: 'Aashirvaad',
    inStock: true
  },
  {
    id: 'p-107',
    sku: 'SUGAR-MADHUR-1KG',
    name: 'Madhur Pure & Hygienic Refined Sugar',
    category: 'Pantry Staples',
    description: 'Sulphur-free crystallized sparkling white sugar.',
    pricePaise: 5400, // ₹54.00
    unit: '1 kg packet',
    onHand: 5,
    reserved: 4,
    lowStockThreshold: 10,
    brand: 'Madhur',
    inStock: true
  },
  {
    id: 'p-108',
    sku: 'OIL-FORTUNE-1L',
    name: 'Fortune Sunlite Refined Sunflower Oil',
    category: 'Pantry Staples',
    description: 'Enriched with Vitamins A and D, light and healthy cooking oil.',
    pricePaise: 16500, // ₹165.00
    unit: '1 Litre pouch',
    onHand: 3,
    reserved: 3,
    lowStockThreshold: 8,
    brand: 'Fortune',
    inStock: false // Out of stock (0 available)
  },
  {
    id: 'p-109',
    sku: 'TEA-REDLABEL-500G',
    name: 'Brooke Bond Red Label Tea',
    category: 'Beverages',
    description: 'Rich taste and aroma with natural tea flavonoids.',
    pricePaise: 28000, // ₹280.00
    unit: '500g box',
    onHand: 22,
    reserved: 1,
    lowStockThreshold: 6,
    brand: 'Brooke Bond',
    inStock: true
  },
  {
    id: 'p-110',
    sku: 'MAGGI-NOODLE-4PK',
    name: 'Maggi 2-Minute Masala Noodles (Pack of 4)',
    category: 'Snacks & Instant Food',
    description: 'Classic blend of 10 spices and fortified with iron.',
    pricePaise: 5600, // ₹56.00
    unit: '280g (4 × 70g)',
    onHand: 40,
    reserved: 5,
    lowStockThreshold: 10,
    brand: 'Nestle Maggi',
    inStock: true
  }
];

export const mockCustomers: Customer[] = [
  {
    id: 'c-001',
    tenantId: 't-freshbasket-001',
    waId: '+91 98201 44521',
    name: 'Ramesh Kumar',
    consentMarketing: true,
    totalOrders: 18,
    totalSpendPaise: 1425000, // ₹14,250
    lastActiveAt: '10 mins ago',
    usualItems: [
      { productId: 'p-102', productName: 'Amul Taaza Toned Milk (1L)', quantity: 2, unitPricePaise: 5600, orderCount: 16 },
      { productId: 'p-103', productName: 'English Oven Whole Wheat Bread', quantity: 1, unitPricePaise: 4500, orderCount: 12 },
      { productId: 'p-104', productName: 'Tata Iodized Salt (1kg)', quantity: 1, unitPricePaise: 2800, orderCount: 6 },
      { productId: 'p-107', productName: 'Madhur Refined Sugar (1kg)', quantity: 1, unitPricePaise: 5400, orderCount: 5 }
    ],
    wishlist: [
      { productId: 'p-105', productName: 'Bru Instant Coffee (100g)', pricePaise: 21500, inStock: true, addedAt: '2 days ago' }
    ]
  },
  {
    id: 'c-002',
    tenantId: 't-freshbasket-001',
    waId: '+91 97110 88231',
    name: 'Priya Sharma',
    consentMarketing: true,
    totalOrders: 4,
    totalSpendPaise: 520000, // ₹5,200
    lastActiveAt: '2 mins ago',
    usualItems: [
      { productId: 'p-109', productName: 'Red Label Tea (500g)', quantity: 1, unitPricePaise: 28000, orderCount: 3 }
    ],
    wishlist: []
  },
  {
    id: 'c-003',
    tenantId: 't-freshbasket-001',
    waId: '+91 98334 19280',
    name: 'Ananya Deshmukh',
    consentMarketing: true,
    totalOrders: 1,
    totalSpendPaise: 89000, // ₹890
    lastActiveAt: '1 hour ago',
    usualItems: [],
    wishlist: [
      { productId: 'p-106', productName: 'Aashirvaad Atta (5kg)', pricePaise: 26500, inStock: true, addedAt: 'Yesterday' }
    ]
  },
  {
    id: 'c-004',
    tenantId: 't-freshbasket-001',
    waId: '+91 99881 22340',
    name: 'Vikram Mehta (Commercial)',
    consentMarketing: false, // V-REC-01: no consent stops marketing templates
    totalOrders: 0,
    totalSpendPaise: 0,
    lastActiveAt: '25 mins ago',
    usualItems: [],
    wishlist: []
  }
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv-001',
    tenantId: 't-freshbasket-001',
    customerId: 'c-001',
    customerName: 'Ramesh Kumar',
    customerPhone: '+91 98201 44521',
    mode: 'ai', // 'ai' | 'human'
    status: 'active',
    lastCustomerMessageAt: 'Just now',
    unreadCount: 0,
    lastMessageSnippet: 'Confirm & Pay via UPI (Cart ₹665)',
    vertical: 'kirana',
    messages: [
      {
        id: 'm-1',
        conversationId: 'conv-001',
        sender: 'customer',
        type: 'audio',
        content: 'Voice note (14s in Hinglish)',
        timestamp: '18:02',
        audioDurationSec: 14,
        transcript: 'Bhaiya, send my usual groceries plus two packets of Amul Taaza milk and this item from my list.',
        confidence: 0.94
      },
      {
        id: 'm-2',
        conversationId: 'conv-001',
        sender: 'customer',
        type: 'image',
        content: 'Handwritten grocery shopping note',
        timestamp: '18:02',
        ocrLines: [
          { text: '1. Tata Salt - 1 kg', confidence: 0.96, matchedSku: 'SALT-TATA-1KG' },
          { text: '2. Bru Coffee - 100g', confidence: 0.91, matchedSku: 'COFFEE-BRU-100G' },
          { text: '3. Aashirvaad Atta - 5kg', confidence: 0.95, matchedSku: 'ATTA-AASH-5KG' }
        ]
      },
      {
        id: 'm-3',
        conversationId: 'conv-001',
        sender: 'ai',
        type: 'interactive_cart',
        content: 'Prepared your My Usual basket and matched your handwritten list against live store inventory:',
        timestamp: '18:03',
        cartData: {
          items: [
            { productId: 'p-102', name: 'Amul Taaza Toned Milk (1L)', variant: '1L pouch', quantity: 2, pricePaise: 11200 },
            { productId: 'p-103', name: 'Whole Wheat Bread', variant: '400g loaf', quantity: 1, pricePaise: 4500 },
            { productId: 'p-104', name: 'Tata Iodized Salt', variant: '1kg pack', quantity: 1, pricePaise: 2800 },
            { productId: 'p-105', name: 'Bru Instant Coffee', variant: '100g jar', quantity: 1, pricePaise: 21500 },
            { productId: 'p-106', name: 'Aashirvaad Select Atta', variant: '5kg bag', quantity: 1, pricePaise: 26500 }
          ],
          subtotalPaise: 66500,
          deliveryFeePaise: 0, // Free delivery above ₹500
          totalPaise: 66500,
          confirmed: false
        }
      }
    ]
  },
  {
    id: 'conv-002',
    tenantId: 't-freshbasket-001',
    customerId: 'c-002',
    customerName: 'Priya Sharma',
    customerPhone: '+91 97110 88231',
    mode: 'human', // Currently escalated!
    status: 'escalated',
    lastCustomerMessageAt: '2 mins ago',
    unreadCount: 1,
    lastMessageSnippet: 'Does the 2-year motor warranty cover café use?',
    escalationReason: 'Product question not answerable from catalog data (commercial warranty terms)',
    aiSummary: 'Customer has selected the Prestige 750W Mixer Grinder (₹3,890) and asks whether manufacturer warranty covers high-duty commercial café usage. The standard catalog warranty only covers domestic residential use.',
    suggestedReply: 'Namaste Priya ji! The Prestige 750W warranty covers domestic household use only. For café or restaurant use, we recommend the Sujata Dynamix 900W Commercial Heavy-Duty Grinder which comes with a 1-year commercial warranty.',
    vertical: 'd2c',
    messages: [
      {
        id: 'm-201',
        conversationId: 'conv-002',
        sender: 'customer',
        type: 'text',
        content: 'Hi, I need a heavy-duty mixer grinder for my new cloud kitchen.',
        timestamp: '17:45'
      },
      {
        id: 'm-202',
        conversationId: 'conv-002',
        sender: 'ai',
        type: 'text',
        content: 'Namaste Priya! We have the Prestige 750W 3-Jar Grinder (₹3,890) and Sujata Dynamix 900W (₹5,650). Both have pure copper motors.',
        timestamp: '17:46'
      },
      {
        id: 'm-203',
        conversationId: 'conv-002',
        sender: 'customer',
        type: 'text',
        content: 'Does the Prestige 2-year warranty cover commercial café use or only home use?',
        timestamp: '17:50'
      },
      {
        id: 'm-204',
        conversationId: 'conv-002',
        sender: 'system',
        type: 'text',
        content: '🤖 AI confidence below threshold. Handed over to merchant team. AI paused.',
        timestamp: '17:50'
      }
    ]
  },
  {
    id: 'conv-003',
    tenantId: 't-freshbasket-001',
    customerId: 'c-003',
    customerName: 'Ananya Deshmukh',
    customerPhone: '+91 98334 19280',
    mode: 'ai',
    status: 'abandoned',
    lastCustomerMessageAt: '1 hour ago',
    unreadCount: 0,
    lastMessageSnippet: 'Cart abandoned at delivery fee check (₹40 charge)',
    escalationReason: 'Cart Abandonment — Probable reason: delivery charge sensitivity (Order ₹320)',
    aiSummary: 'Customer built a ₹320 cart and stopped when ₹40 delivery fee appeared. Tenant free delivery kicks in at ₹500. Recovery suggestion: suggest adding 1 staple item (e.g. Fortune Oil) to unlock Free Delivery.',
    suggestedReply: 'Hi Ananya! Add items worth ₹180 more (like cooking oil or tea) to get FREE home delivery today!',
    vertical: 'kirana',
    messages: [
      {
        id: 'm-301',
        conversationId: 'conv-003',
        sender: 'customer',
        type: 'text',
        content: '1 packet Aashirvaad Atta 5kg bhej do',
        timestamp: '16:30'
      },
      {
        id: 'm-302',
        conversationId: 'conv-003',
        sender: 'ai',
        type: 'text',
        content: 'Aashirvaad Atta 5kg is ₹265 + Delivery fee ₹40 = Total ₹305. Would you like to confirm?',
        timestamp: '16:31'
      }
    ]
  }
];

export const mockOrders: Order[] = [
  {
    id: 'ord-8891',
    orderNumber: 'ORD-8891',
    tenantId: 't-freshbasket-001',
    customerId: 'c-004',
    customerName: 'Vikram Mehta',
    customerPhone: '+91 99881 22340',
    deliveryAddress: {
      street: 'Flat 402, Sunshine Heights',
      area: 'Andheri West',
      pincode: '400058',
      landmark: 'Near station'
    },
    items: [
      { productId: 'p-106', name: 'Aashirvaad Atta 5kg', variant: '5kg', quantity: 2, unitPricePaise: 26500, totalPaise: 53000 },
      { productId: 'p-105', name: 'Bru Instant Coffee 100g', variant: '100g', quantity: 4, unitPricePaise: 21500, totalPaise: 86000 },
      { productId: 'p-109', name: 'Red Label Tea 500g', variant: '500g', quantity: 3, unitPricePaise: 28000, totalPaise: 84000 }
    ],
    subtotalPaise: 223000,
    taxPaise: 11150,
    deliveryFeePaise: 0,
    totalPaise: 234150, // ₹2,341.50
    status: 'pending_dispatch_confirmation',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    createdAt: '25 mins ago',
    riskAssessment: {
      score: 62,
      band: 'Medium',
      factors: [
        { factor: 'First-time COD buyer', impact: 'warning', detail: 'No past completed deliveries on record' },
        { factor: 'Vague landmark', impact: 'warning', detail: '"Near station" lacks precise building/gate number' },
        { factor: 'Cart size above median', impact: 'warning', detail: '₹2,341 vs typical kirana first-order ₹480' }
      ],
      recommendation: 'Send automated WhatsApp address confirmation button & nudge ₹50 discount for instant UPI prepaid.',
      label: 'Illustrative heuristic (Phase 11)'
    }
  },
  {
    id: 'ord-8890',
    orderNumber: 'ORD-8890',
    tenantId: 't-freshbasket-001',
    customerId: 'c-001',
    customerName: 'Ramesh Kumar',
    customerPhone: '+91 98201 44521',
    deliveryAddress: {
      street: 'Bungalow 12, Gulmohar Cross Road 7',
      area: 'JVPD Scheme, Juhu',
      pincode: '400049',
      landmark: 'Opposite Jamnabai School'
    },
    items: [
      { productId: 'p-102', name: 'Amul Taaza Toned Milk (1L)', variant: '1L', quantity: 2, unitPricePaise: 5600, totalPaise: 11200 },
      { productId: 'p-103', name: 'Whole Wheat Bread', variant: '400g', quantity: 1, unitPricePaise: 4500, totalPaise: 4500 },
      { productId: 'p-104', name: 'Tata Iodized Salt', variant: '1kg', quantity: 1, unitPricePaise: 2800, totalPaise: 2800 }
    ],
    subtotalPaise: 18500,
    taxPaise: 925,
    deliveryFeePaise: 4000,
    totalPaise: 23425, // ₹234.25
    status: 'dispatched',
    paymentMethod: 'upi_link',
    paymentStatus: 'paid', // Verified via payment webhook (V-PAY-01)
    createdAt: '2 hours ago',
    dispatchedAt: '1 hour ago',
    trackingNumber: 'TRK-MUM-9941',
    riskAssessment: {
      score: 12,
      band: 'Low',
      factors: [
        { factor: 'Prepaid via UPI', impact: 'positive', detail: 'Razorpay webhook payment verified' },
        { factor: 'Verified repeat buyer', impact: 'positive', detail: '18 successful deliveries at same address' }
      ],
      recommendation: 'Auto-approved for fast dispatch.',
      label: 'Illustrative heuristic (Phase 11)'
    }
  },
  {
    id: 'ord-8889',
    orderNumber: 'ORD-8889',
    tenantId: 't-freshbasket-001',
    customerId: 'c-002',
    customerName: 'Priya Sharma',
    customerPhone: '+91 97110 88231',
    deliveryAddress: {
      street: 'Flat 101, Sea View Residency',
      area: 'Bandra West',
      pincode: '400050',
      landmark: 'Next to Café Coffee Day'
    },
    items: [
      { productId: 'p-109', name: 'Brooke Bond Red Label Tea', variant: '500g', quantity: 2, unitPricePaise: 28000, totalPaise: 56000 }
    ],
    subtotalPaise: 56000,
    taxPaise: 2800,
    deliveryFeePaise: 0,
    totalPaise: 58800, // ₹588.00
    status: 'delivered',
    paymentMethod: 'whatsapp_pay',
    paymentStatus: 'paid',
    createdAt: 'Yesterday at 15:40',
    dispatchedAt: 'Yesterday at 16:15',
    trackingNumber: 'TRK-MUM-9812',
    riskAssessment: {
      score: 18,
      band: 'Low',
      factors: [
        { factor: 'WhatsApp Pay completed', impact: 'positive', detail: 'Meta payment webhook received' }
      ],
      recommendation: 'Standard fulfillment.',
      label: 'Illustrative heuristic (Phase 11)'
    }
  },
  {
    id: 'ord-8888',
    orderNumber: 'ORD-8888',
    tenantId: 't-freshbasket-001',
    customerId: 'c-005',
    customerName: 'Rahul Verma',
    customerPhone: '+91 98920 33119',
    deliveryAddress: {
      street: 'Shop 4, Market Galli',
      area: 'Kurla West',
      pincode: '400070'
    },
    items: [
      { productId: 'p-106', name: 'Aashirvaad Atta 5kg', variant: '5kg', quantity: 1, unitPricePaise: 26500, totalPaise: 26500 },
      { productId: 'p-105', name: 'Bru Instant Coffee 100g', variant: '100g', quantity: 1, unitPricePaise: 21500, totalPaise: 21500 }
    ],
    subtotalPaise: 48000,
    taxPaise: 2400,
    deliveryFeePaise: 4000,
    totalPaise: 54400,
    status: 'pending_dispatch_confirmation',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    createdAt: '3 hours ago',
    riskAssessment: {
      score: 84,
      band: 'High',
      factors: [
        { factor: '3 COD cancellations in past 14 days', impact: 'danger', detail: 'Customer refused delivery twice at doorstep' },
        { factor: 'New phone number linked to high return address', impact: 'danger', detail: 'Address match score 94% with prior return' }
      ],
      recommendation: 'DO NOT DISPATCH. Call customer to confirm or require 100% advance UPI payment.',
      label: 'Illustrative heuristic (Phase 11)'
    }
  }
];

export const mockLeads: Lead[] = [
  {
    id: 'lead-01',
    name: 'Siddharth Roy',
    phone: '+91 98200 44901',
    requirement: '3BHK Apartment in Powai / Hiranandani',
    budgetRange: '₹2.8 Cr – ₹3.5 Cr',
    timeline: 'Within 60 days',
    status: 'appointment_booked',
    bookedSlot: {
      date: '15 Nov 2026',
      time: '11:00 AM IST',
      calendarEventId: 'gcal_ev_881920391'
    },
    followUpStep: 'Pre-visit reminder WhatsApp template scheduled 2 hours prior',
    stopFollowUp: true, // Lead booked appointment; automated follow-up halted
    createdAt: '3 days ago'
  },
  {
    id: 'lead-02',
    name: 'Dr. Kavita Nambiar',
    phone: '+91 99120 77314',
    requirement: 'Commercial Clinic Space (800–1200 sqft)',
    budgetRange: '₹45,000 / month rent',
    timeline: 'Immediate (15 days)',
    status: 'qualifying',
    followUpStep: 'Step 2: Sent 3 available floorplan PDFs via WhatsApp Flow',
    stopFollowUp: false,
    createdAt: 'Yesterday'
  },
  {
    id: 'lead-03',
    name: 'Harsh Vardhan',
    phone: '+91 97722 11984',
    requirement: 'Tata Safari Dark Edition Test Drive',
    budgetRange: '₹24 Lakh on-road',
    timeline: 'This weekend',
    status: 'appointment_booked',
    bookedSlot: {
      date: '16 Nov 2026',
      time: '04:30 PM IST',
      calendarEventId: 'gcal_ev_4412093'
    },
    followUpStep: 'Dealership sales representative auto-assigned',
    stopFollowUp: true,
    createdAt: '4 hours ago'
  }
];

export const mockKPIs = {
  todayRevenuePaise: 4892000, // ₹48,920
  revenueDeltaPercent: 18.4,
  todayOrdersCount: 42,
  ordersDeltaCount: 8,
  chatToOrderConversionRate: 34.8,
  conversionDeltaPercent: 12.4,
  abandonedCartsRecoveredPaise: 4260000, // ₹42,600
  abandonedCartsRecoveredCount: 29,
  aiResolutionRate: 88.2,
  avgResponseSeconds: 1.8,
  rtoRiskFlaggedCount: 6,
  rtoPreventedPaise: 1840000 // ₹18,400 saved
};

