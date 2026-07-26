create table public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  email text not null,
  phone text not null,
  subject text not null,
  message text not null,
  status text default 'New' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.contact_messages enable row level security;

create policy "Public can insert contact messages" 
on public.contact_messages 
for insert to public 
with check (true);

create policy "Authenticated admin can view contact messages" 
on public.contact_messages 
for select to authenticated 
using (true);

create policy "Authenticated admin can update contact messages" 
on public.contact_messages 
for update to authenticated 
using (true);

create policy "Authenticated admin can delete contact messages" 
on public.contact_messages 
for delete to authenticated 
using (true);
