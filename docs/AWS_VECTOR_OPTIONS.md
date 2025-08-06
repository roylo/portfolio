# AWS Vector Database Options for Portfolio

## 🎯 Cost-Effective Recommendation: RDS PostgreSQL + pgvector

### 💰 Pricing (us-east-1)
- **db.t3.micro**: $14.40/month (1 vCPU, 1GB RAM)
- **20GB gp2 storage**: $2.30/month
- **Backup storage**: ~$1/month
- **Total**: ~$18/month

### ✅ Why RDS + pgvector?
- Battle-tested PostgreSQL with vector extensions
- Managed service (AWS handles maintenance)
- Scales with your needs
- Integrates perfectly with Vercel
- No vendor lock-in (standard SQL + vectors)

## 🛠️ Implementation Guide

### Step 1: Create RDS Instance
```bash
# Via AWS CLI
aws rds create-db-instance \
  --db-instance-identifier portfolio-vectors \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username postgres \
  --master-user-password your-secure-password \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-your-security-group \
  --publicly-accessible
```

### Step 2: Enable pgvector Extension
```sql
-- Connect to your RDS instance
CREATE EXTENSION IF NOT EXISTS vector;
```

### Step 3: Create Stories Table
```sql
CREATE TABLE stories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI embedding dimension
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create vector similarity index
CREATE INDEX ON stories 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

### Step 4: Update Vector Store Implementation
```typescript
// lib/aws-vector-store.ts
import { Pool } from 'pg';

export class AWSVectorStore {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.RDS_HOST,
      port: 5432,
      database: 'postgres',
      user: process.env.RDS_USER,
      password: process.env.RDS_PASSWORD,
      ssl: { rejectUnauthorized: false }
    });
  }

  async addStory(story: ProcessedStory, embedding: number[]) {
    const query = `
      INSERT INTO stories (id, title, content, embedding, metadata)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET
        title = $2, content = $3, embedding = $4, metadata = $5
    `;
    
    await this.pool.query(query, [
      story.slug,
      story.title,
      this.createRichContext(story),
      `[${embedding.join(',')}]`, // PostgreSQL vector format
      JSON.stringify(this.extractMetadata(story))
    ]);
  }

  async searchStories(queryEmbedding: number[], limit: number = 5) {
    const query = `
      SELECT id, title, metadata, 
             1 - (embedding <=> $1) as similarity_score
      FROM stories
      WHERE 1 - (embedding <=> $1) > 0.2
      ORDER BY embedding <=> $1
      LIMIT $2
    `;
    
    const result = await this.pool.query(query, [
      `[${queryEmbedding.join(',')}]`,
      limit
    ]);
    
    return result.rows;
  }
}
```

### Step 5: Environment Variables
```bash
# Add to Vercel environment variables
RDS_HOST=your-rds-endpoint.amazonaws.com
RDS_USER=postgres  
RDS_PASSWORD=your-secure-password
RDS_DATABASE=postgres
```

## 🔄 Alternative AWS Options

### Option 2: Amazon Bedrock Knowledge Base
```typescript
// Most AWS-native option
// Pay per query: ~$0.0004 per search
// Fully managed RAG

import { BedrockAgent } from '@aws-sdk/client-bedrock-agent';

export class BedrockVectorStore {
  private client: BedrockAgent;
  
  constructor() {
    this.client = new BedrockAgent({
      region: 'us-east-1'
    });
  }
  
  async searchStories(query: string) {
    return await this.client.retrieve({
      knowledgeBaseId: 'your-kb-id',
      retrievalQuery: { text: query },
      retrievalConfiguration: {
        vectorSearchConfiguration: {
          numberOfResults: 5
        }
      }
    });
  }
}
```

**Bedrock Pricing:**
- Knowledge Base storage: $0.10/GB/month
- Vector search: $0.0004 per query
- For your use case: ~$1-5/month

### Option 3: OpenSearch Serverless
```typescript
// Good for medium scale
// ~$50-100/month minimum

import { Client } from '@opensearch-project/opensearch';

export class OpenSearchVectorStore {
  private client: Client;
  
  async searchStories(queryVector: number[]) {
    return await this.client.search({
      index: 'stories',
      body: {
        query: {
          knn: {
            embedding: {
              vector: queryVector,
              k: 5
            }
          }
        }
      }
    });
  }
}
```

## 📊 Final Recommendation

### For Your Portfolio:
1. **Start with keyword-only** (deploy now, $0)
2. **Upgrade to RDS + pgvector** when ready (~$18/month)
3. **Consider Bedrock later** if you want full AWS integration

### Cost Comparison:
- **Supabase Free**: $0 (best value)
- **AWS RDS + pgvector**: $18/month (good AWS integration)
- **AWS Bedrock**: $1-5/month (pay-per-use, most convenient)
- **AWS OpenSearch**: $50+/month (overkill for portfolio)

**RDS + pgvector gives you AWS integration at reasonable cost while keeping your vector search capabilities!** 🎯