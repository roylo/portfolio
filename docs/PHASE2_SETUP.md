# Phase 2: Vector Search Setup Guide

This guide covers setting up the enhanced semantic search capabilities for Roy's AI chatbot using ChromaDB and OpenAI embeddings.

## 🎯 Overview

Phase 2 enhances the chatbot with vector-based semantic search, allowing it to find relevant stories based on meaning rather than just keyword matching. This significantly improves the quality of responses for:

- Complex behavioral interview questions
- Job description analysis with nuanced requirements  
- General conversations requiring contextual understanding

## 🏗️ Architecture

```
Story Content → OpenAI Embeddings → ChromaDB → Hybrid Search → Enhanced Responses
                                        ↓
                               Keyword Search (Fallback)
```

### Key Components

1. **Vector Store** (`lib/vector-store.ts`) - ChromaDB integration and embedding management
2. **Hybrid Search** (`lib/hybrid-story-search.ts`) - Combines vector and keyword search
3. **Enhanced Actions** (`lib/chatbot-actions.ts`) - Updated to use semantic search
4. **Management Tools** - Scripts for setup and maintenance

## 🚀 Quick Setup

### Prerequisites

- Docker and Docker Compose installed
- OpenAI API key configured in `.env.local`
- Existing story data processed (run `npm run build-knowledge` first)

### 1-Command Setup

For the fastest setup, run:

```bash
npm run vector:setup
```

This will:
1. Start ChromaDB in Docker
2. Wait for it to be ready
3. Populate the vector store with all processed stories

### Manual Setup

If you prefer step-by-step control:

```bash
# 1. Start ChromaDB
npm run chromadb:start

# 2. Verify it's running
npm run chromadb:status

# 3. Populate vector store
npm run populate-vector-store
```

## 🔧 Detailed Setup Instructions

### Step 1: Start ChromaDB

ChromaDB runs in a Docker container for easy management:

```bash
# Start ChromaDB service
npm run chromadb:start

# Check status
npm run chromadb:status

# View logs if needed
./scripts/manage-chromadb.sh logs
```

ChromaDB will be available at `http://localhost:8000` with data persisted in `./chroma-data/`.

### Step 2: Environment Configuration

Ensure your `.env.local` has:

```env
OPENAI_API_KEY=your_openai_api_key_here
CHROMA_URL=http://localhost:8000  # Optional, defaults to this
```

### Step 3: Populate Vector Store

Generate embeddings for all processed stories:

```bash
npm run populate-vector-store
```

This process:
- Generates embeddings for ~100 stories
- Takes 2-3 minutes to complete
- Costs approximately $0.001 in OpenAI API usage
- Provides detailed progress and testing output

### Step 4: Verify Installation

The populate script automatically tests search functionality. You should see output like:

```
🧪 Testing search functionality...

🔍 Testing query: "leadership experience"
   Found 3 relevant stories:
   1. Building High-Performance Teams at Appier (hybrid, score: 0.892)
   2. Scaling Engineering Culture at BotBonnie (vector, score: 0.834)
   3. Managing Cross-Cultural Teams (keyword, score: 0.756)
```

## 📊 Usage and Features

### Hybrid Search Benefits

The system now provides:

- **Semantic Understanding**: "team management" finds stories about "leadership" and "people development"
- **Context Awareness**: Job requirements match similar experiences even with different terminology
- **Intelligent Ranking**: Combines vector similarity with keyword relevance for optimal results
- **Diversity**: Avoids returning too many similar stories from the same company/role

### Fallback Strategy

The system gracefully handles:
- ChromaDB unavailable → Falls back to keyword search
- OpenAI API issues → Uses cached embeddings or keyword search
- Network problems → Maintains full functionality with existing JSON data

### Performance Optimizations

- **Batch Processing**: Embeddings generated in batches to respect rate limits
- **Caching**: Vector embeddings stored permanently, no re-generation needed
- **Efficient Search**: ChromaDB provides sub-second search times
- **Hybrid Scoring**: Weighted combination of vector and keyword results

## 🛠️ Management Commands

### ChromaDB Management

```bash
# Service control
npm run chromadb:start     # Start ChromaDB
npm run chromadb:stop      # Stop ChromaDB
npm run chromadb:status    # Check status

# Advanced management
./scripts/manage-chromadb.sh restart   # Restart service
./scripts/manage-chromadb.sh logs      # View logs
./scripts/manage-chromadb.sh reset     # Reset all data (destructive)
```

### Vector Store Management

```bash
# Initial setup
npm run populate-vector-store          # Populate with all stories

# Full rebuild
npm run build-knowledge-full           # Process stories + populate vectors

# Manual management (in code)
const hybridSearch = new HybridStorySearch();
await hybridSearch.clearVectorStore(); # Clear all vectors
await hybridSearch.populateVectorStore(); # Repopulate
```

## 🔍 Search Configuration

### Search Weights

Different use cases use optimized search weights:

```typescript
// Job Description Analysis (prioritize semantic similarity)
vectorWeight: 0.8, keywordWeight: 0.2

// Behavioral Questions (high semantic focus with diversity)
vectorWeight: 0.9, keywordWeight: 0.1, diversityBoost: true

// General Questions (balanced approach)
vectorWeight: 0.6, keywordWeight: 0.4, diversityBoost: true
```

### Filtering Options

Search can be filtered by:
- Company: `{ filters: { company: "BotBonnie" } }`
- Role: `{ filters: { role: "Head of Product" } }`
- Impact Level: `{ filters: { impactLevel: "high" } }`
- Competencies: `{ filters: { competencies: ["leadership", "product_strategy"] } }`

## 💰 Cost Analysis

### Embedding Generation (One-time)
- ~100 stories × 500 tokens average = 50,000 tokens
- OpenAI text-embedding-3-small: $0.00002/1K tokens
- Total cost: ~$0.001 for initial setup

### Ongoing Costs
- **Search**: Free (uses stored embeddings)
- **New Stories**: ~$0.00001 per new story added
- **ChromaDB**: Free (self-hosted)

## 🐛 Troubleshooting

### ChromaDB Connection Issues

```bash
# Check if ChromaDB is running
curl http://localhost:8000/api/v1/heartbeat

# View logs
./scripts/manage-chromadb.sh logs

# Reset and restart
./scripts/manage-chromadb.sh reset
npm run chromadb:start
```

### Embedding Generation Issues

```bash
# Check OpenAI API key
echo $OPENAI_API_KEY

# Test with smaller batch
# Modify scripts/populate-vector-store.ts batchSize to 2

# Check rate limits
# OpenAI allows 3,000 requests/minute for embeddings
```

### Search Issues

```bash
# Check vector store status
const stats = await hybridSearch.getStats();
console.log(stats);

# Force keyword fallback
const results = await hybridSearch.searchStories(query, { useVector: false });
```

## 🔄 Development Workflow

### Adding New Stories

1. Add story file to `content/stories/`
2. Run `npm run process-stories`
3. Run `npm run populate-vector-store` (or it auto-detects new stories)

### Updating Search Logic

1. Modify search parameters in `lib/chatbot-actions.ts`
2. Test with different queries
3. Adjust weights based on relevance quality

### Monitoring Performance

The chatbot actions now include search source information:
- "vector" - Found via semantic similarity
- "keyword" - Found via keyword matching  
- "hybrid" - Found by both methods (highest confidence)

## 📈 Success Metrics

Phase 2 improvements should show:
- Better story matching for complex behavioral questions
- More relevant JD analysis with nuanced requirements
- Reduced "no relevant stories found" responses
- Higher user satisfaction with story relevance

## 🚀 Next Steps

Once Phase 2 is working well:
- Monitor user feedback on story relevance
- A/B test vector vs keyword search
- Consider upgrading to larger embedding models
- Implement real-time embedding updates
- Add story clustering and recommendation features

## 📋 Quick Reference

```bash
# Complete Phase 2 setup
npm run vector:setup

# Check everything is working
npm run chromadb:status
curl http://localhost:8000/api/v1/heartbeat

# Test the chatbot with complex queries like:
# "Tell me about Roy's experience managing cross-functional teams"
# "How does Roy handle technical leadership challenges?"
```

Phase 2 transforms the chatbot from keyword matching to true semantic understanding, providing much more intelligent and relevant responses!