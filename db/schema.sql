-- 1. Users Table (Role Agnostic - The core identity)
CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "full_name" varchar,
  "email" varchar UNIQUE NOT NULL,
  "password_hash" varchar NOT NULL,
  "phone_number" varchar,
  "sudo_customer_id" varchar UNIQUE NOT NULL, -- The single Sudo customer ID for the person
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

-- 2. Profiles Table (The "Hats" a user can wear)
CREATE TABLE "profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "profile_type" varchar NOT NULL, -- 'RIDER', 'MERCHANT'
  "sudo_account_id" varchar UNIQUE NOT NULL, -- Each profile gets its own Sudo Account (Wallet)
  "status" varchar NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'suspended'
  "created_at" timestamptz DEFAULT now(),
  FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

-- 3. Bus Balances Table (Linked to a RIDER PROFILE)
CREATE TABLE "bus_balances" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "rider_profile_id" uuid UNIQUE NOT NULL,
  "balance" decimal(12, 2) NOT NULL DEFAULT 0.00,
  "updated_at" timestamptz DEFAULT now(),
  FOREIGN KEY ("rider_profile_id") REFERENCES "profiles" ("id") ON DELETE CASCADE
);

-- 4. Cards Table (Linked to a specific PROFILE)
CREATE TABLE "cards" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "profile_id" uuid NOT NULL,
  "card_type" varchar NOT NULL, -- 'MIFARE_RIDER', 'MIFARE_MERCHANT', 'VIRTUAL_VISA'
  "card_uid" varchar UNIQUE, -- For MIFARE cards
  "sudo_card_id" varchar UNIQUE, -- For Sudo virtual cards
  "status" varchar NOT NULL DEFAULT 'active',
  "created_at" timestamptz DEFAULT now(),
  FOREIGN KEY ("profile_id") REFERENCES "profiles" ("id")
);

-- 5. Transactions Table (A record of all financial events)
CREATE TABLE "transactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "profile_id" uuid NOT NULL,
  "transaction_type" varchar NOT NULL, -- e.g., 'TRANSFER_TO_BUS', 'FARE_PAYMENT'
  "amount" decimal(12, 2) NOT NULL,
  "status" varchar NOT NULL DEFAULT 'completed', -- 'completed', 'pending', 'failed'
  "reference" varchar UNIQUE, -- Can be from payment provider or internal
  "description" text,
  "created_at" timestamptz DEFAULT now(),
  FOREIGN KEY ("profile_id") REFERENCES "profiles" ("id")
);

-- Other tables like Terminals, etc., will be linked to these core tables.