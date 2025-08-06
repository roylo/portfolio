# Phase 2: Vector Search Testing Guide

This guide provides step-by-step instructions to test the Phase 2 vector search implementation and verify that ChromaDB semantic search is working correctly.

## 🎯 Testing Overview

Phase 2 testing focuses on:
1. **Vector Search Verification** - Confirming ChromaDB is working
2. **Fallback Behavior** - Ensuring keyword search works when vector fails
3. **Search Quality** - Comparing semantic vs keyword results
4. **Transparency** - Understanding which search method is being used

## 🚀 Quick Start Testing

### Prerequisites Check

Before testing, ensure you have:
```bash
# Check required environment variables
echo "OpenAI API Key: ${OPENAI_API_KEY:0:10}..." 
echo "Chroma URL: ${CHROMA_URL:-http://localhost:8000}"

# Verify Docker is running (if using Docker setup)
docker --version
```

### Alternative Setup Options

If Docker is not available, you have these options:

#### Option 1: Install Docker (Recommended)
```bash
# On macOS with Homebrew
brew install --cask docker

# On macOS with official installer
# Download from: https://docs.docker.com/desktop/install/mac-install/

# On Linux
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

#### Option 2: Local ChromaDB Installation
```bash
# Install ChromaDB directly with pip
pip install chromadb

# Start ChromaDB server
chroma run --host localhost --port 8000 --path ./chroma-data
```

#### Option 3: Keyword-Only Mode (Fallback Testing)
If you want to test the fallback behavior without ChromaDB:
- ChromaDB will be unavailable
- System will automatically use keyword-only search
- You can still test the transparency features

### 1. Complete Setup Verification

```bash
# 1. Start ChromaDB and populate vector store
npm run vector:setup

# 2. Verify ChromaDB is running
npm run chromadb:status

# Expected output:
# ✅ ChromaDB is running at http://localhost:8000
# 📊 Service: healthy
# 🔢 Port 8000: accessible
```

## 🧪 Detailed Testing Steps

### Step 1: ChromaDB Service Testing

```bash
# Test ChromaDB heartbeat
curl http://localhost:8000/api/v1/heartbeat

# Expected response:
# {"nanosecond heartbeat":...}

# Check ChromaDB logs
./scripts/manage-chromadb.sh logs

# Should show successful startup messages
```

### Step 2: Vector Store Population Testing

```bash
# Run the population script with verbose output
npm run populate-vector-store

# Expected output sequence:
# 📚 Loading processed stories...
# 🔍 Found 100 processed stories
# 🚀 Initializing vector store...
# ✅ Vector store initialized successfully
# 📊 Processing 100 stories for vector store...
# 🧪 Testing search functionality...
# ✅ Vector search found 3 results
# 🎯 Returning 3 hybrid results
```

**⚠️ Key Success Indicators:**
- No "ChromaDB not available" warnings
- "Vector store initialized successfully" message
- Test search returns results with vector scores
- Final message: "Vector store setup complete! 🎉"

### Step 3: Search Transparency Testing

The enhanced system now provides detailed logging to show which search method is being used. Here's how to test it:

#### 3a. Test Vector Search Working

Start your development server and watch the console:
```bash
npm run dev
```

Open the chatbot and ask: **"Tell me about Roy's leadership experience"**

**Expected Console Output:**
```
🔍 Hybrid Search Query: "leadership experience"
📊 Vector Available: true, Use Vector: true
🔮 Attempting vector search...
✅ Vector search found 3 results
🔤 Performing keyword search...
✅ Keyword search found 5 results
📈 Final search method: hybrid
🔄 Merging vector and keyword results
🎯 Returning 3 hybrid results
```

**What This Tells You:**
- ✅ Vector search is working (found 3 results)
- ✅ Hybrid mode is active (both methods working)
- ✅ ChromaDB is available and responding

#### 3b. Test Keyword Fallback

Stop ChromaDB to test fallback behavior:
```bash
npm run chromadb:stop
```

Ask the same question: **"Tell me about Roy's leadership experience"**

**Expected Console Output:**
```
🔍 Hybrid Search Query: "leadership experience"
📊 Vector Available: false, Use Vector: true
⚠️  Vector search not available: ChromaDB not available or not initialized
🔤 Performing keyword search...
✅ Keyword search found 5 results
📈 Final search method: keyword_only
🔤 Using keyword-only results
```

**What This Tells You:**
- ⚠️ Vector search failed gracefully
- ✅ Keyword fallback is working
- ✅ System continues to function without ChromaDB

### Step 4: Search Quality Comparison

#### Test Semantic Understanding

With ChromaDB running, test these queries that should demonstrate semantic search superiority:

1. **Query:** "team management challenges"
   - **Vector search should find:** Stories about leadership, people development, culture building
   - **Keyword search would miss:** Stories that use different terminology like "personnel oversight" or "staff coordination"

2. **Query:** "scaling engineering teams"
   - **Vector search should find:** Stories about growth, hiring, process improvement
   - **Check console:** Look for high vector scores (>0.8) on relevant stories

3. **Query:** "product strategy decisions"
   - **Vector search should find:** Stories about roadmap planning, feature prioritization, market analysis
   - **Semantic benefit:** Finds stories even if they don't contain exact phrase "product strategy"

#### Compare Search Sources

Look for these indicators in the search results metadata:

```typescript
// In the chatbot response, check the source indicators:
{
  source: 'vector',     // Found only by semantic search
  source: 'keyword',    // Found only by keyword search  
  source: 'hybrid',     // Found by both (highest confidence)
  vectorScore: 0.85,    // Semantic similarity score
  keywordScore: 0.72,   // Keyword relevance score
  searchMetadata: {
    vectorAvailable: true,
    searchMethod: 'hybrid',
    vectorDistance: 0.15
  }
}
```

### Step 5: Different Use Case Testing

Test the different search configurations used by various chatbot functions:

#### Job Description Analysis (80% vector, 20% keyword)
```
Ask: "Analyze this job description: Senior Product Manager with 5+ years experience in B2B SaaS, strong analytical skills, team leadership experience"
```

**Expected:** Heavy emphasis on semantic matching of requirements to Roy's experience

#### Behavioral Questions (90% vector, 10% keyword)
```
Ask: "Tell me about a time Roy had to make a difficult decision under pressure"
```

**Expected:** Should find stories that semantically relate to decision-making and pressure situations

#### General Questions (60% vector, 40% keyword)
```
Ask: "What experience does Roy have with AI and machine learning?"
```

**Expected:** Balanced approach finding both exact matches and semantically related content

## 🔍 Monitoring and Diagnostics

### Check Vector Store Statistics

You can programmatically check the vector store status:

```typescript
// Add this to any API route or component for debugging
const hybridSearch = new HybridStorySearch();
await hybridSearch.initialize();

const stats = await hybridSearch.getStats();
console.log('Vector Store Stats:', stats);

// Expected output:
// {
//   vector: { available: true, count: 100, collection: 'roy-stories' },
//   keyword: { available: true, count: 100, competencies: 25, companies: 8 }
// }
```

### Debug Search Scoring

For detailed debugging, you can modify the search options:

```typescript
const results = await hybridSearch.searchStories("your query", {
  limit: 5,
  vectorWeight: 0.8,
  keywordWeight: 0.2,
  diversityBoost: true,
  threshold: 0.1  // Lower threshold to see more results
});

results.forEach(result => {
  console.log(`Story: ${result.story.title}`);
  console.log(`Source: ${result.source}`);
  console.log(`Vector Score: ${result.vectorScore}`);
  console.log(`Keyword Score: ${result.keywordScore}`);
  console.log(`Final Score: ${result.relevanceScore}`);
  console.log('---');
});
```

## ✅ Success Criteria Checklist

### ChromaDB Integration
- [ ] ChromaDB starts successfully with `npm run chromadb:start`
- [ ] Heartbeat endpoint responds at `http://localhost:8000/api/v1/heartbeat`
- [ ] Vector store populates without errors
- [ ] Console shows "Vector store initialized successfully"

### Vector Search Functionality
- [ ] Vector search finds relevant results for complex queries
- [ ] Console shows "Vector search found X results" 
- [ ] Search method shows as "hybrid" or "vector_only"
- [ ] Vector scores are reasonable (typically 0.3-0.95)

### Fallback Behavior
- [ ] System works when ChromaDB is stopped
- [ ] Console shows fallback warnings clearly
- [ ] Search method shows as "keyword_only"
- [ ] No application crashes or errors

### Search Quality
- [ ] Semantic queries find relevant stories even with different terminology
- [ ] Hybrid results include both vector and keyword scores
- [ ] Different use cases use appropriate search weights
- [ ] Diversity boost prevents over-clustering

### Transparency Features
- [ ] Console clearly shows which search method is active
- [ ] Fallback reasons are logged when vector search fails
- [ ] Search metadata includes vectorAvailable status
- [ ] Individual result sources are labeled correctly

## 🐛 Common Issues and Solutions

### Issue: "ChromaDB not available" 
**Solution:** 
```bash
# Check if Docker is running
docker ps

# Restart ChromaDB
./scripts/manage-chromadb.sh restart

# Check logs for errors
./scripts/manage-chromadb.sh logs
```

### Issue: "Vector search failed"
**Solution:**
```bash
# Check OpenAI API key
echo $OPENAI_API_KEY

# Check API rate limits
# OpenAI allows 3,000 requests/minute for embeddings

# Test with smaller batch
# Modify populate script batchSize to 2
```

### Issue: Low quality semantic results
**Solution:**
```bash
# Increase vector weight for more semantic focus
vectorWeight: 0.9, keywordWeight: 0.1

# Lower similarity threshold to see more candidates  
threshold: 0.2

# Check if stories need better content processing
```

### Issue: No search results
**Solution:**
```bash
# Check vector store count
const stats = await hybridSearch.getStats();

# Repopulate if empty
npm run populate-vector-store

# Check if stories are processed
ls data/processed/
```

## 🎯 What Good Results Look Like

### Successful Vector Search Console Output
```
🔍 Hybrid Search Query: "conflict resolution experience"
📊 Vector Available: true, Use Vector: true
🔮 Attempting vector search...
✅ Vector search found 4 results
🔤 Performing keyword search...
✅ Keyword search found 3 results
📈 Final search method: hybrid
🔄 Merging vector and keyword results
🎯 Returning 5 hybrid results
```

### High-Quality Semantic Results
- Stories about "team disagreements" found when searching for "conflict resolution"
- "Leadership challenges" queries find stories about "people management"
- "Technical decisions" finds stories about "architecture choices" and "tool selection"
- Vector scores above 0.7 for highly relevant matches
- Diverse results from different companies and time periods

### Graceful Fallback Behavior
```
🔍 Hybrid Search Query: "startup experience"
📊 Vector Available: false, Use Vector: true
⚠️  Vector search not available: ChromaDB not available or not initialized
🔤 Performing keyword search...
✅ Keyword search found 6 results
📈 Final search method: keyword_only
🔤 Using keyword-only results
```

## 🚀 Next Steps After Testing

Once Phase 2 testing is successful:

1. **Monitor Production Usage**
   - Watch for vector search success rates
   - Monitor response quality feedback
   - Track fallback frequency

2. **Optimize Search Parameters**
   - Adjust vector/keyword weights based on result quality
   - Fine-tune diversity boost settings
   - Optimize embedding generation process

3. **Performance Monitoring**
   - Measure search response times
   - Monitor ChromaDB resource usage
   - Track OpenAI API costs

4. **Consider Phase 3 Enhancements**
   - Real-time embedding updates
   - Advanced filtering capabilities
   - Story clustering and recommendations

**🎉 Congratulations!** If all tests pass, you now have a sophisticated semantic search system that dramatically improves chatbot response quality while maintaining robust fallback capabilities!