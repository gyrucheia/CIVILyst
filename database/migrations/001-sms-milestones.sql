ALTER TABLE sms_notifications
  ADD COLUMN milestone_id BIGINT UNSIGNED NULL UNIQUE,
  ADD COLUMN message_body VARCHAR(160) NULL,
  ADD CONSTRAINT sms_milestone_fk FOREIGN KEY (milestone_id) REFERENCES petition_milestones(milestone_id);
