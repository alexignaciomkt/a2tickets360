ALTER TABLE events ADD CONSTRAINT events_operation_status_check CHECK (operation_status IN ('closed', 'open'));
