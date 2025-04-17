-- Create a table for images
create table images (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text,
  url text not null,
  category text,
  tags text[],
  views integer default 0,
  description text
);

-- Create an index for faster searching
create index images_category_idx on images(category);
create index images_tags_idx on images using gin(tags);
create index images_views_idx on images(views);
create index images_created_at_idx on images(created_at);
create index images_description_idx on images using gin(to_tsvector('english', description));

-- Enable Row Level Security
alter table images enable row level security;

-- Create policies
create policy "Allow public read access" on images for select using (true);
create policy "Allow authenticated users to insert" on images for insert with check (auth.role() = 'authenticated');
create policy "Allow authenticated users to update" on images for update using (auth.role() = 'authenticated');
create policy "Allow authenticated users to delete" on images for delete using (auth.role() = 'authenticated'); 