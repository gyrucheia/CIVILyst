-- Select a fresh CIVILyst development database before importing.
-- This file creates the revised schema. It does not migrate the earlier draft.
CREATE TABLE petitioners (
  petitioner_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  contact_number VARCHAR(24),
  address VARCHAR(255),
  INDEX (last_name, first_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE document_owners (
  document_owner_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  INDEX (last_name, first_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE petition_types (
  petition_type_id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  type_code VARCHAR(40) NOT NULL UNIQUE,
  type_name VARCHAR(150) NOT NULL,
  legal_basis VARCHAR(80) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE staff_accounts (
  staff_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('personnel', 'super_admin') NOT NULL DEFAULT 'personnel',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE petitions (
  petition_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transaction_ref_no VARCHAR(40) NOT NULL UNIQUE,
  cce_number VARCHAR(40) NOT NULL,
  petitioner_id BIGINT UNSIGNED NOT NULL,
  document_owner_id BIGINT UNSIGNED NOT NULL,
  relationship_to_owner VARCHAR(80) NOT NULL,
  petition_type_id SMALLINT UNSIGNED NOT NULL,
  physical_box_number VARCHAR(60) NOT NULL,
  physical_location_note VARCHAR(255),
  filing_date DATE NOT NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  INDEX (cce_number),
  FOREIGN KEY (petitioner_id) REFERENCES petitioners(petitioner_id),
  FOREIGN KEY (document_owner_id) REFERENCES document_owners(document_owner_id),
  FOREIGN KEY (petition_type_id) REFERENCES petition_types(petition_type_id),
  FOREIGN KEY (created_by) REFERENCES staff_accounts(staff_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Intake and its first milestone must be written in one transaction.
-- The current stage comes from the latest recorded milestone with changes_current_stage = TRUE.
CREATE TABLE petition_milestones (
  milestone_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  petition_id BIGINT UNSIGNED NOT NULL,
  stage_code VARCHAR(60) NOT NULL,
  stage_status VARCHAR(40) NOT NULL,
  outcome_code VARCHAR(60),
  effective_on DATE NOT NULL,
  changes_current_stage BOOLEAN NOT NULL,
  public_remark TEXT,
  internal_note TEXT,
  recorded_by BIGINT UNSIGNED NOT NULL,
  recorded_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX (petition_id, changes_current_stage, recorded_at, milestone_id),
  FOREIGN KEY (petition_id) REFERENCES petitions(petition_id),
  FOREIGN KEY (recorded_by) REFERENCES staff_accounts(staff_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE audit_events (
  audit_event_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  actor_staff_id BIGINT UNSIGNED NOT NULL,
  petition_id BIGINT UNSIGNED,
  target_staff_id BIGINT UNSIGNED,
  action VARCHAR(80) NOT NULL,
  change_details JSON,
  recorded_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX (actor_staff_id, recorded_at),
  INDEX (petition_id, recorded_at),
  FOREIGN KEY (actor_staff_id) REFERENCES staff_accounts(staff_id),
  FOREIGN KEY (petition_id) REFERENCES petitions(petition_id),
  FOREIGN KEY (target_staff_id) REFERENCES staff_accounts(staff_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sms_notifications (
  sms_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  petition_id BIGINT UNSIGNED NOT NULL,
  milestone_id BIGINT UNSIGNED NULL UNIQUE,
  message_body VARCHAR(160),
  recipient_mobile VARCHAR(24) NOT NULL,
  provider_code VARCHAR(40) NOT NULL,
  provider_message_id VARCHAR(120),
  delivery_status VARCHAR(30) NOT NULL DEFAULT 'queued',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  sent_at TIMESTAMP(6) NULL DEFAULT NULL,
  status_updated_at TIMESTAMP(6) NULL DEFAULT NULL,
  INDEX (petition_id, created_at),
  UNIQUE (provider_code, provider_message_id),
  FOREIGN KEY (petition_id) REFERENCES petitions(petition_id),
  FOREIGN KEY (milestone_id) REFERENCES petition_milestones(milestone_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
