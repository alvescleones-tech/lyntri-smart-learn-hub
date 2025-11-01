-- Create app_role enum
create type public.app_role as enum ('user', 'admin');

-- Create user_roles table to store role assignments
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

-- Enable RLS on user_roles
alter table public.user_roles enable row level security;

-- Create security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Policy to allow users to view their own roles
create policy "Users can view their own roles"
on public.user_roles
for select
using (auth.uid() = user_id);

-- Policy to allow admins to view all roles
create policy "Admins can view all roles"
on public.user_roles
for select
using (public.has_role(auth.uid(), 'admin'));

-- Create profiles table for additional user info
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Policy to allow users to view their own profile
create policy "Users can view their own profile"
on public.profiles
for select
using (auth.uid() = id);

-- Policy to allow users to update their own profile
create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign default 'user' role to new users
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');
  
  return new;
end;
$$;

-- Trigger to create profile and assign role on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create chat_messages table for IA Chat functionality
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Enable RLS on chat_messages
alter table public.chat_messages enable row level security;

-- Policy to allow users to view their own messages
create policy "Users can view their own messages"
on public.chat_messages
for select
using (auth.uid() = user_id);

-- Policy to allow users to insert their own messages
create policy "Users can insert their own messages"
on public.chat_messages
for insert
with check (auth.uid() = user_id);

-- Create index for faster queries
create index idx_chat_messages_user_id on public.chat_messages(user_id, created_at desc);