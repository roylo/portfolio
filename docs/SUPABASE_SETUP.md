# Supabase Vector Search Setup Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Sign up/login with GitHub
4. Click "New Project"
5. Choose settings:
   - **Name**: `portfolio-vector-search`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (perfect for your needs)

### Step 2: Get Your Environment Variables
Once your project is created (takes ~2 minutes):

1. Go to **Settings** → **API**
2. Copy these values:

```bash
# Add to your .env.local file
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Set Up Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste this SQL:

```sql
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

-- Allow insert/update/delete for authenticated users (for populating data)
create policy "Stories are manageable by authenticated users" on stories
  for all using (auth.role() = 'authenticated');

-- Grant usage on the search function
grant execute on function search_stories to anon, authenticated;
```

4. Click **Run** to execute the SQL

### Step 4: Test Your Setup

```bash
# Update your .env.local with the Supabase credentials
# Then test the connection:
npm run populate-vector-store
```

You should see:
```
🚀 Starting vector store population...
📊 Initializing search systems...
Supabase vector store initialized successfully
```

## 🎯 Environment Variables

Add these to your `.env.local`:

```bash
# Existing variables (keep these)
OPENAI_API_KEY=sk-proj-...
RESEND_API_KEY=re_...

# New Supabase variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

## 📊 What You Get

### Free Tier Limits (More than enough!)
- **500MB Database** (you need ~1-5MB)
- **50,000 Monthly Active Users** (way more than needed)
- **2 CPU Hours** (sufficient for your usage)
- **50MB File Storage** (not needed for vectors)

### Vector Search Capabilities
- ✅ **Semantic Search** - Understanding meaning, not just keywords
- ✅ **Hybrid Search** - Combines vector + keyword search
- ✅ **Production Ready** - Works on Vercel without Docker
- ✅ **SQL Queries** - Can query vectors with regular PostgreSQL
- ✅ **Real-time** - Instant search results

## 🧪 Testing Commands

```bash
# Populate Supabase with your stories
npm run populate-supabase-vector-store

# Test development server
npm run dev

# Test production build
npm run build && npm start
```

## 🚀 Deployment to Vercel

Once your Supabase is set up:

1. **Add environment variables to Vercel:**
   - Go to your Vercel project settings
   - Add the Supabase environment variables
   
2. **Deploy:**
   ```bash
   git push origin main
   ```

3. **Your chatbot now has semantic search in production!** 🎉

## 📈 Monitoring

In your Supabase dashboard:
- **Database** → **Tables** → `stories` to see your data
- **API** → **Logs** to monitor usage
- **Settings** → **Usage** to track free tier usage

## 💰 Cost Breakdown

- **Development**: $0 (free tier)
- **Production**: $0 (free tier handles your traffic easily)
- **Scaling**: Only pay if you exceed 500MB database or 50k users

**Perfect for a portfolio website!** 🎯