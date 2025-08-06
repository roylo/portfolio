# Production Deployment Guide for Phase 2 Vector Search

## 🚨 Vercel Deployment Considerations

**ChromaDB Docker containers will NOT work on Vercel** because:
- Vercel is serverless (no persistent containers)
- No Docker support
- No persistent file system
- Functions have execution time limits

## 🔄 Production Options

### Option 1: ChromaDB Cloud (Recommended)
```bash
# Sign up at https://www.trychroma.com/
# Get hosted endpoint URL
CHROMA_URL=https://api.trychroma.com
CHROMA_API_KEY=your-api-key-here
```

**Pros:**
- Managed service, no infrastructure
- Built for production scale
- Same API as local ChromaDB

**Cons:**
- Additional cost (~$20-50/month)
- External dependency

### Option 2: Keyword-Only Mode (Zero Config)
The system automatically falls back to keyword search when ChromaDB is unavailable.

**Pros:**
- Zero additional setup
- No external dependencies
- Still provides good search quality

**Cons:**
- Loses semantic search capabilities
- Less intelligent story matching

### Option 3: Alternative Vector Database

#### Pinecone (Serverless Vector DB)
```bash
pnpm install @pinecone-database/pinecone
PINECONE_API_KEY=your-key
PINECONE_INDEX_NAME=portfolio-stories
```

#### Supabase Vector (PostgreSQL + pgvector)
```bash
pnpm install @supabase/supabase-js
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

## 🛠️ Pre-Production Setup

### Step 1: Choose Your Vector Strategy

**For Quick Deployment (Keyword-Only):**
```bash
# No additional setup needed
# System will automatically fall back
```

**For Full Vector Search (ChromaDB Cloud):**
```bash
# 1. Sign up at trychroma.com
# 2. Create a collection
# 3. Update environment variables
# 4. Re-populate vector store
```

### Step 2: Update Environment Variables

Add to your Vercel environment variables:
```bash
# Required (already set)
OPENAI_API_KEY=sk-proj-...
RESEND_API_KEY=re_...

# Optional (for vector search)
CHROMA_URL=https://api.trychroma.com  # If using ChromaDB Cloud
CHROMA_API_KEY=your-api-key           # If using ChromaDB Cloud
```

### Step 3: Test Production Build

```bash
# 1. Build locally with production config
npm run build

# 2. Test production server
npm start

# 3. Verify chatbot works
# - Test with ChromaDB unavailable
# - Confirm keyword fallback works
```

### Step 4: Deploy to Vercel

```bash
# 1. Push to main branch
git checkout main
git merge feature/phase-2-vector-search
git push origin main

# 2. Vercel will auto-deploy
# 3. Monitor deployment logs
```

## 🧪 Production Testing Checklist

After deployment, test these scenarios:

### ✅ Keyword Search Fallback
- [ ] Chatbot responds to queries
- [ ] Console shows "keyword_only" search method
- [ ] Response quality is acceptable

### ✅ Vector Search (if enabled)
- [ ] Console shows "hybrid" search method
- [ ] Semantic queries work correctly
- [ ] No ONNX runtime errors

### ✅ Performance
- [ ] Page load times under 3 seconds
- [ ] Chatbot responses under 5 seconds
- [ ] No function timeouts

## 📊 Monitoring

Watch for these in Vercel logs:
```bash
# Good indicators
"📈 Final search method: hybrid"
"📈 Final search method: keyword_only"

# Warning indicators
"❌ Vector search failed, falling back"
"⚠️ Vector search not available"

# Error indicators (need fixing)
"OpenAI API error"
"ChromaDB connection failed"
```

## 💰 Cost Considerations

### Current Setup (Keyword + Local Vector)
- **OpenAI API**: ~$0.001 for initial embedding generation
- **ChromaDB**: Free (self-hosted)
- **Total**: ~$0.001 one-time

### Production Options

#### Option 1: Keyword-Only
- **Cost**: $0 additional
- **Performance**: Good
- **Features**: Basic search

#### Option 2: ChromaDB Cloud
- **Cost**: ~$20-50/month
- **Performance**: Excellent
- **Features**: Full semantic search

#### Option 3: Pinecone
- **Cost**: ~$70/month (starter)
- **Performance**: Excellent
- **Features**: Full semantic search + analytics

## 🚀 Recommended Approach

For your portfolio website, I recommend:

### Phase 1: Deploy with Keyword Fallback
1. Deploy current code to Vercel
2. System automatically uses keyword-only search
3. Monitor performance and user feedback

### Phase 2: Add Vector Search Later (Optional)
1. If you want semantic search capabilities
2. Set up ChromaDB Cloud or Pinecone
3. Update environment variables
4. Re-populate embeddings

## 🔧 Code Changes Needed

### Update for Production

```typescript
// lib/vector-store-client.ts
export async function isChromaAvailable(url: string = 'http://localhost:8000'): Promise<boolean> {
  try {
    // In production, this might be a different URL
    const chromaUrl = process.env.CHROMA_URL || url;
    const response = await fetch(`${chromaUrl}/api/v2/heartbeat`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok;
  } catch {
    return false;
  }
}
```

### Update Docker Compose (Development Only)

Add comment to docker-compose file:
```yaml
# docker-compose.vector.yml
# NOTE: This is for local development only
# Vercel deployment will use external vector DB or keyword fallback
services:
  chromadb:
    # ... existing config
```

## 🎯 Summary

**Quick Production Deploy:**
1. Current code works out-of-the-box on Vercel
2. Will automatically use keyword-only search
3. No additional setup required
4. Can add vector search later if desired

**The system is production-ready with graceful fallback!** 🚀