-- Supabase schema for Leave Management app
-- Run this in the Supabase SQL editor to create the required tables.

-- Ensure pgcrypto is enabled for UUID generation
create extension if not exists "pgcrypto";

-- Users table for employee/admin login
create table if not exists public.users (
  username text not null primary key,
  password text not null,
  role text not null check (role in ('admin', 'employee')),
  name text not null,
  dept text not null,
  created_at timestamptz not null default now()
);

-- Leaves table for leave requests
create table if not exists public.leaves (
  id uuid not null primary key default gen_random_uuid(),
  submittedBy text not null references public.users(username) on delete cascade,
  name text not null,
  dept text not null,
  type text not null check (type in ('Casual', 'Sick', 'Annual')),
  "from" date not null,
  "to" date not null,
  reason text,
  status text not null check (status in ('Pending', 'Approved', 'Rejected')),
  created_at timestamptz not null default now()
);
