#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { StoryProcessor, ProcessedStory } from '../lib/story-processor';

async function processAllStories() {
  const processor = new StoryProcessor();
  const storiesDir = path.join(process.cwd(), 'content/stories');
  const outputDir = path.join(process.cwd(), 'data/knowledge-base/stories');
  const processedDir = path.join(process.cwd(), 'data/knowledge-base/processed');

  // Ensure output directories exist
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(processedDir, { recursive: true });

  // Check if stories directory exists
  if (!fs.existsSync(storiesDir)) {
    console.log('📁 Creating stories directory...');
    fs.mkdirSync(storiesDir, { recursive: true });
    
    console.log('✨ Stories directory created at content/stories/');
    console.log('📝 Please add your story .md files directly to content/stories/');
    console.log('   The system will automatically categorize them based on content.');
    console.log('');
    console.log('Example story format:');
    console.log(`---
title: "Your Story Title"
summary: "Brief summary of the story"
company: "Company Name"
role: "Your Role"
timeframe: "2023"
---

# Your Story Content
Write your story here naturally...`);
    return;
  }

  // Process all .md files in stories directory
  const storyFiles = getAllMarkdownFiles(storiesDir);
  
  if (storyFiles.length === 0) {
    console.log('📝 No story files found in content/stories/');
    console.log('Please add some .md files with the following format:');
    console.log(`
---
title: "Your Story Title"
summary: "Brief summary of the story"
company: "Company Name"
role: "Your Role"
timeframe: "2023"
---

# Your Story Content

Write your story here naturally...
`);
    return;
  }

  const processedStories: ProcessedStory[] = [];
  const errors: Array<{file: string, error: string}> = [];

  console.log(`🔄 Processing ${storyFiles.length} story files...`);

  for (const filePath of storyFiles) {
    try {
      const fileName = path.basename(filePath);
      console.log(`📖 Processing: ${fileName}`);
      
      const processedStory = await processor.processStory(filePath);
      processedStories.push(processedStory);
      
      console.log(`   ✅ Extracted ${processedStory.competencies.length} competencies, ${processedStory.metrics.length} metrics`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`   ❌ Error processing ${path.basename(filePath)}: ${errorMsg}`);
      errors.push({ file: path.basename(filePath), error: errorMsg });
    }
  }

  if (processedStories.length === 0) {
    console.log('❌ No stories were successfully processed');
    if (errors.length > 0) {
      console.log('\nErrors encountered:');
      errors.forEach(({ file, error }) => {
        console.log(`   ${file}: ${error}`);
      });
    }
    return;
  }

  // Group stories by category
  console.log('📊 Grouping stories by category...');
  const groupedStories = groupStoriesByCategory(processedStories);

  // Write processed stories to JSON files
  let totalWritten = 0;
  for (const [category, stories] of Object.entries(groupedStories)) {
    if (stories.length > 0) {
      const outputPath = path.join(outputDir, `${category}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(stories, null, 2));
      console.log(`💾 Written ${stories.length} stories to ${category}.json`);
      totalWritten += stories.length;
    }
  }

  // Create story index
  console.log('📋 Creating story index...');
  const storyIndex = createStoryIndex(processedStories);
  fs.writeFileSync(
    path.join(processedDir, 'story-index.json'),
    JSON.stringify(storyIndex, null, 2)
  );

  // Create competency map
  const competencyMap = createCompetencyMap(processedStories);
  fs.writeFileSync(
    path.join(processedDir, 'competency-map.json'),
    JSON.stringify(competencyMap, null, 2)
  );

  console.log('✨ Story processing complete!');
  console.log(`📈 Successfully processed: ${totalWritten} stories`);
  console.log(`🎯 Found competencies: ${Object.keys(competencyMap.competencies).length}`);
  console.log(`🏢 Companies covered: ${storyIndex.companies.length}`);
  
  if (errors.length > 0) {
    console.log(`⚠️  Errors encountered: ${errors.length}`);
  }
}

function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath));
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function groupStoriesByCategory(stories: ProcessedStory[]) {
  const groups: Record<string, ProcessedStory[]> = {
    leadership: [],
    product: [],
    technical: [],
    business: [],
    personal: []
  };

  for (const story of stories) {
    // Stories can belong to multiple categories
    // Add to all relevant categories based on competencies
    
    if (story.competencies.includes('leadership') || 
        story.competencies.includes('culture_building')) {
      groups.leadership.push(story);
    }
    
    if (story.competencies.includes('product_management') || 
        story.competencies.includes('innovation')) {
      groups.product.push(story);
    }
    
    if (story.competencies.includes('technical') || 
        story.competencies.includes('engineering')) {
      groups.technical.push(story);
    }
    
    if (story.competencies.includes('growth') || 
        story.competencies.includes('international')) {
      groups.business.push(story);
    }
    
    // If doesn't fit other categories or has personal elements
    if (story.competencies.includes('crisis_management') ||
        story.content.toLowerCase().includes('personal') ||
        story.content.toLowerCase().includes('family') ||
        groups.leadership.length === 0 && 
        groups.product.length === 0 && 
        groups.technical.length === 0 && 
        groups.business.length === 0) {
      groups.personal.push(story);
    }
  }

  return groups;
}

function createStoryIndex(stories: ProcessedStory[]) {
  return {
    total_stories: stories.length,
    competencies: getUniqueCompetencies(stories),
    companies: getUniqueCompanies(stories),
    timeframes: getTimeframes(stories),
    seniority_levels: getSeniorityLevels(stories),
    impact_levels: getImpactLevels(stories),
    last_updated: new Date().toISOString(),
    processing_summary: {
      stories_by_category: groupStoriesByCategory(stories),
      total_metrics_extracted: stories.reduce((sum, story) => sum + story.metrics.length, 0),
      total_competencies_found: [...new Set(stories.flatMap(s => s.competencies))].length
    }
  };
}

function createCompetencyMap(stories: ProcessedStory[]) {
  const competencyCount: Record<string, number> = {};
  const competencyStories: Record<string, string[]> = {};
  
  stories.forEach(story => {
    story.competencies.forEach(comp => {
      competencyCount[comp] = (competencyCount[comp] || 0) + 1;
      if (!competencyStories[comp]) {
        competencyStories[comp] = [];
      }
      competencyStories[comp].push(story.slug);
    });
  });

  return {
    competencies: competencyCount,
    story_mapping: competencyStories,
    most_common: Object.entries(competencyCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([comp, count]) => ({ competency: comp, story_count: count }))
  };
}

function getUniqueCompetencies(stories: ProcessedStory[]): string[] {
  return [...new Set(stories.flatMap(story => story.competencies))].sort();
}

function getUniqueCompanies(stories: ProcessedStory[]): string[] {
  return [...new Set(stories.map(story => story.company))].sort();
}

function getTimeframes(stories: ProcessedStory[]): string[] {
  return [...new Set(stories.map(story => story.timeframe))].sort();
}

function getSeniorityLevels(stories: ProcessedStory[]): Record<string, number> {
  const levels: Record<string, number> = {};
  stories.forEach(story => {
    levels[story.seniorityLevel] = (levels[story.seniorityLevel] || 0) + 1;
  });
  return levels;
}

function getImpactLevels(stories: ProcessedStory[]): Record<string, number> {
  const levels: Record<string, number> = {};
  stories.forEach(story => {
    levels[story.impactLevel] = (levels[story.impactLevel] || 0) + 1;
  });
  return levels;
}

// Run the script
if (require.main === module) {
  processAllStories().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}