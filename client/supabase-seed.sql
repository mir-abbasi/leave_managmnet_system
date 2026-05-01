-- Seed data for the Leave Management app
-- Run this after creating the schema.

insert into public.users (username, password, role, name, dept)
values
  ('admin', 'admin123', 'admin', 'Administrator', ''),
  ('employee1', 'emp123', 'employee', 'Alice Johnson', 'HR'),
  ('employee2', 'emp456', 'employee', 'Bob Smith', 'Engineering');

insert into public.leaves (submittedBy, name, dept, type, "from", "to", reason, status)
values
  ('employee1', 'Alice Johnson', 'HR', 'Casual', '2026-05-10', '2026-05-12', 'Family appointment', 'Pending'),
  ('employee2', 'Bob Smith', 'Engineering', 'Sick', '2026-05-15', '2026-05-16', 'Medical rest', 'Approved');
