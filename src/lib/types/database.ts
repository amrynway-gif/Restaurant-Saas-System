export type Restaurant = {
  id: string;
  name: string;
  subdomain: string;
  slug?: string;
  logo_url?: string | null;
  theme_color?: string | null;
  
  headline?: string | null;
  
  subheadline?: string | null;
  
  hero_background_url?: string | null;
  
  footer_note?: string | null;
  
  public_address?: string | null;
  
  public_maps_url?: string | null;
  
  public_phone_1?: string | null;
  public_phone_2?: string | null;
  public_phone_3?: string | null;
  
  social_facebook_url?: string | null;
  social_instagram_url?: string | null;
  social_tiktok_url?: string | null;
  
  currency_code?: string | null;
  
  secondary_currency_enabled?: boolean | null;
  
  secondary_currency_code?: string | null;
  
  secondary_currency_exchange_rate?: number | null;
  
  menu_title_animation_enabled?: boolean | null;
  
  menu_banner_url?: string | null;
  menu_banner_kind?: "image" | "video" | null;
  
  menu_banner_caption?: string | null;
  
  loyalty_program_enabled?: boolean | null;
  
  loyalty_spend_cents_per_point?: number | null;
  
  loyalty_point_value_cents?: number | null;
  
  phone_country_prefix?: string | null;
  
  waiters_system_enabled?: boolean | null;
  status?: "active" | "suspended" | "trial" | null;
  created_at?: string;
  updated_at?: string;
};

export type Category = {
  id: string;
  restaurant_id: string;
  name: string;
  sort_order?: number | null;
  created_at?: string;
  updated_at?: string;
};


export type PriceOption = {
  label: string;
  price_cents: number;
};

export type MenuItem = {
  id: string;
  restaurant_id: string;
  category_id?: string | null;
  name: string;
  description: string | null;
  price: number;
  
  secondary_price?: number | null;
  
  price_options?: PriceOption[] | null;
  
  secondary_price_options?: PriceOption[] | null;
  
  calories?: string | null;
  
  is_meal?: boolean | null;
  image_url: string | null;
  is_available?: boolean;
  category?: string | null; // denormalized or legacy text category
  created_at?: string;
  updated_at?: string;
};

/** Menu item with category relation (from join) */
export type MenuItemWithCategory = MenuItem & {
  categories?: Category | null;
};

export type UserRole = "super_admin" | "owner";

export type Profile = {
  id: string; // same as auth.users.id
  restaurant_id: string | null; // null for super_admin
  role: UserRole | string | null;
  username?: string | null; 
  login_email?: string | null; 
  created_at?: string;
  updated_at?: string;
};


export type RestaurantWaiter = {
  id: string;
  restaurant_id: string;
  name: string;
  sort_order: number | null;
  created_at?: string;
};


export type RestaurantTable = {
  id: string;
  restaurant_id: string;
  label: string;
  public_token: string;
  sort_order: number | null;
  
  waiter_id?: string | null;
  created_at?: string;
};

export type OrderFulfillment = "dine_in" | "pickup" | "delivery";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type GuestOrder = {
  id: string;
  restaurant_id: string;
  table_id: string | null;
  
  waiter_id?: string | null;
  fulfillment: OrderFulfillment;
  delivery_address: string | null;
  customer_phone: string;
  status: OrderStatus;
  
  display_number: number;
  
  tracking_token: string;
  created_at: string;
  
  loyalty_points_used: number;
  
  loyalty_discount_cents: number;
  
  loyalty_points_earned_on_order: number;
  
  completion_accounting_done?: boolean;
  
  staff_notes?: string | null;
  
  owner_discount_cents?: number | null;
};

export type GuestOrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price_cents: number;
  price_option_label: string | null;
  line_total_cents: number;
  
  excluded_ingredients?: string[] | null;
  menu_item_name?: string;
};

export type GuestOrderWithDetails = GuestOrder & {
  table_label: string | null;
  
  table_waiter_id?: string | null;
  
  waiter_name?: string | null;
  items: GuestOrderItem[];
  
  customer_loyalty_points_balance: number;
  
  owner_can_apply_loyalty_redeem: boolean;
  
  owner_redeem_max_points: number;
  
  owner_redeem_max_discount_cents: number;
};


export type RestaurantCustomerPhone = {
  id: string;
  restaurant_id: string;
  phone_normalized: string;
  first_seen_at?: string;
  last_order_at?: string;
  order_count: number;
  total_spent_cents: number;
  points_balance: number;
  lifetime_points_earned: number;
  lifetime_points_redeemed: number;
};

export type LoyaltyPointReason =
  | "earn_order"
  | "redeem"
  | "bonus_campaign"
  | "admin_adjust"
  | "expiry";


export type LoyaltyPointLedgerEntry = {
  id: string;
  restaurant_id: string;
  phone_normalized: string;
  order_id: string | null;
  delta_points: number;
  reason: LoyaltyPointReason;
  note: string | null;
  created_at: string;
};

export type CustomerProfile = {
  id: string;
  restaurant_id: string;
  phone_normalized: string;
  name: string | null;
  email: string | null;
  preferred_channel: "sms" | "whatsapp" | "email";
  marketing_opt_in: boolean;
  created_at: string;
  updated_at: string;
};

export type LoyaltyAccount = {
  id: string;
  restaurant_id: string;
  customer_id: string;
  points_balance: number;
  lifetime_earned: number;
  lifetime_redeemed: number;
  updated_at: string;
};

export type LoyaltyTransactionType =
  | "earn"
  | "redeem_cash"
  | "redeem_reward"
  | "adjustment"
  | "expiry"
  | "bonus";

export type LoyaltyTransaction = {
  id: string;
  restaurant_id: string;
  customer_id: string;
  order_id: string | null;
  tx_type: LoyaltyTransactionType;
  points_delta: number;
  money_value_cents: number;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type LoyaltyReward = {
  id: string;
  restaurant_id: string;
  title: string;
  description: string | null;
  points_cost: number;
  active: boolean;
  optional_stock: number | null;
  valid_from: string | null;
  valid_to: string | null;
  created_at: string;
  updated_at: string;
};

export type LoyaltyRewardRedemption = {
  id: string;
  restaurant_id: string;
  customer_id: string;
  reward_id: string;
  order_id: string | null;
  loyalty_transaction_id: string;
  points_spent: number;
  created_at: string;
};

export type OutboundNotificationChannel = "sms" | "whatsapp" | "email";
export type OutboundNotificationStatus = "queued" | "processing" | "sent" | "failed";

export type OutboundNotification = {
  id: string;
  restaurant_id: string;
  customer_id: string;
  channel: OutboundNotificationChannel;
  template_key: string;
  payload: Record<string, unknown>;
  status: OutboundNotificationStatus;
  provider_message_id: string | null;
  error: string | null;
  scheduled_at: string;
  sent_at: string | null;
  created_at: string;
};
