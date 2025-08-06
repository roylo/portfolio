-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create stories table for vector search
create table stories (
  id text primary key,
  title text not null,
  content text not null,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index for vector similarity search using cosine distance
create index on stories using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Create an index on metadata for filtering
create index stories_metadata_gin_idx on stories using gin (metadata);

-- Create a function to search stories by vector similarity
create or replace function search_stories(
  query_embedding vector(1536),
  match_threshold float default 0.2,
  match_count int default 5
)
returns table (
  id text,
  title text,
  content text,
  metadata jsonb,
  distance float
)
language sql stable
as $$
  select
    stories.id,
    stories.title,
    stories.content,
    stories.metadata,
    1 - (stories.embedding <=> query_embedding) as distance
  from stories
  where 1 - (stories.embedding <=> query_embedding) > match_threshold
  order by stories.embedding <=> query_embedding
  limit match_count;
$$;

-- Create a function to update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create a trigger to automatically update the updated_at column
create trigger update_stories_updated_at
  before update on stories
  for each row execute function update_updated_at_column();

-- Add RLS (Row Level Security) policies
alter table stories enable row level security;

-- Allow read access to stories (for the chatbot)
create policy "Stories are viewable by everyone" on stories
  for select using (true);

-- Allow insert/update/delete for service role and anon (for populating data)
create policy "Stories are manageable by service role" on stories
  for all using (auth.jwt() ->> 'role' = 'service_role');

-- Allow insert/update for anon users (for populating data during development)
create policy "Stories are insertable by anon" on stories
  for insert with check (true);

-- Grant usage on the search function
grant execute on function search_stories to anon, authenticated;