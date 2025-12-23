CREATE TYPE "message_status" AS ENUM (
  'PENDING',
  'SENDING',
  'SENT',
  'FAILED'
);

CREATE TABLE "users" (
  "id" varchar(36) PRIMARY KEY,
  "whatsapp_phone_number" varchar(20) UNIQUE,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "last_login_at" timestamp
);

CREATE TABLE "sessions" (
  "id" varchar(36) PRIMARY KEY,
  "user_id" varchar(36) UNIQUE NOT NULL,
  "session_data" text,
  "is_authenticated" boolean NOT NULL DEFAULT false,
  "last_activity" timestamp NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "configurations" (
  "id" varchar(36) PRIMARY KEY,
  "user_id" varchar(36) UNIQUE NOT NULL,
  "delay_between_messages" int NOT NULL DEFAULT 5,
  "max_retries" int NOT NULL DEFAULT 3,
  "session_path" varchar(255) NOT NULL,
  "auto_save_history" boolean NOT NULL DEFAULT true,
  "last_modified" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "contacts" (
  "id" varchar(36) PRIMARY KEY,
  "user_id" varchar(36) NOT NULL,
  "name" varchar(255) NOT NULL,
  "phone_number" varchar(20) NOT NULL,
  "formatted_number" varchar(25) NOT NULL,
  "is_valid" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "messages" (
  "id" varchar(36) PRIMARY KEY,
  "user_id" varchar(36) NOT NULL,
  "contact_id" varchar(36),
  "phone_number" varchar(20) NOT NULL,
  "content" text NOT NULL,
  "file_path" varchar(500),
  "file_name" varchar(255),
  "status" message_status NOT NULL DEFAULT 'PENDING',
  "error_message" text,
  "retry_count" int NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "sent_at" timestamp
);

CREATE UNIQUE INDEX "idx_sessions_user_id" ON "sessions" ("user_id");

CREATE INDEX "idx_sessions_authenticated" ON "sessions" ("is_authenticated");

CREATE UNIQUE INDEX "idx_configurations_user_id" ON "configurations" ("user_id");

CREATE INDEX "idx_contacts_user_id" ON "contacts" ("user_id");

CREATE INDEX "idx_contacts_phone" ON "contacts" ("phone_number");

CREATE UNIQUE INDEX "idx_contacts_user_phone_unique" ON "contacts" ("user_id", "phone_number");

CREATE INDEX "idx_contacts_name" ON "contacts" ("name");

CREATE INDEX "idx_messages_user_id" ON "messages" ("user_id");

CREATE INDEX "idx_messages_contact_id" ON "messages" ("contact_id");

CREATE INDEX "idx_messages_status" ON "messages" ("status");

CREATE INDEX "idx_messages_phone" ON "messages" ("phone_number");

CREATE INDEX "idx_messages_created" ON "messages" ("created_at");

CREATE INDEX "idx_messages_user_status" ON "messages" ("user_id", "status");

COMMENT ON TABLE "users" IS 'Single user - the person using the desktop application';

COMMENT ON TABLE "sessions" IS 'WhatsApp Web session - persists between app restarts';

COMMENT ON COLUMN "sessions"."session_data" IS 'Serialized WhatsApp session (JSON)';

COMMENT ON TABLE "configurations" IS 'User configuration - saved locally and restored on restart';

COMMENT ON COLUMN "configurations"."delay_between_messages" IS 'Seconds between messages';

COMMENT ON TABLE "contacts" IS 'User saved contacts - prevents duplicate phone numbers per user';

COMMENT ON TABLE "messages" IS 'Messages with optional file attachments - keeps phone_number even if contact is deleted';

COMMENT ON COLUMN "messages"."contact_id" IS 'Optional: reference to saved contact';

COMMENT ON COLUMN "messages"."phone_number" IS 'Recipient phone number (denormalized for history)';

COMMENT ON COLUMN "messages"."file_path" IS 'Optional: path to attached file';

COMMENT ON COLUMN "messages"."file_name" IS 'Optional: name of attached file';

ALTER TABLE "users" ADD FOREIGN KEY ("id") REFERENCES "sessions" ("user_id") ON DELETE CASCADE;

ALTER TABLE "users" ADD FOREIGN KEY ("id") REFERENCES "configurations" ("user_id") ON DELETE CASCADE;

ALTER TABLE "contacts" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "messages" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

ALTER TABLE "messages" ADD FOREIGN KEY ("contact_id") REFERENCES "contacts" ("id") ON DELETE SET NULL;
