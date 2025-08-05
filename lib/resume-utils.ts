import fs from 'fs';
import path from 'path';
import type { ProcessedResume, WorkExperience } from './resume-processor.js';

export class ResumeDataAccess {
  private resume: ProcessedResume | null = null;

  constructor() {
    this.loadResume();
  }

  private loadResume() {
    try {
      const resumePath = path.join(process.cwd(), 'data', 'knowledge-base', 'resume', 'processed-resume.json');
      const resumeData = fs.readFileSync(resumePath, 'utf-8');
      this.resume = JSON.parse(resumeData);
    } catch (error) {
      console.error('Failed to load resume data:', error);
      this.resume = null;
    }
  }

  getFullResume(): ProcessedResume | null {
    return this.resume;
  }

  getPersonalInfo() {
    return this.resume?.personalInfo || null;
  }

  getWorkExperience(): WorkExperience[] {
    return this.resume?.workExperience || [];
  }

  getEducation() {
    return this.resume?.education || [];
  }

  getSkills() {
    return this.resume?.skills || [];
  }

  getSummary() {
    return this.resume?.summary || null;
  }

  getCompetencyProfile() {
    return this.resume?.competencyProfile || {};
  }

  // Query methods for chatbot
  getExperienceByCompany(company: string): WorkExperience | undefined {
    return this.resume?.workExperience.find(exp => 
      exp.company.toLowerCase().includes(company.toLowerCase())
    );
  }

  getExperienceByRole(roleKeyword: string): WorkExperience[] {
    return this.resume?.workExperience.filter(exp => 
      exp.role.toLowerCase().includes(roleKeyword.toLowerCase())
    ) || [];
  }

  getExperienceByCompetency(competency: string): WorkExperience[] {
    return this.resume?.workExperience.filter(exp => 
      exp.competencies.includes(competency)
    ) || [];
  }

  getTechnologiesUsed(): string[] {
    const allTech = this.resume?.workExperience.flatMap(exp => exp.technologies) || [];
    const skillTech = this.resume?.skills.flatMap(skill => skill.skills) || [];
    return [...new Set([...allTech, ...skillTech])];
  }

  getRelevantExperienceForJD(jobDescription: string): {
    relevantExperience: WorkExperience[];
    matchedCompetencies: string[];
    matchedTechnologies: string[];
    relevanceScore: number;
  } {
    const jdLower = jobDescription.toLowerCase();
    const relevantExp: WorkExperience[] = [];
    const matchedCompetencies: Set<string> = new Set();
    const matchedTech: Set<string> = new Set();

    // Find relevant experiences
    this.resume?.workExperience.forEach(exp => {
      let relevance = 0;
      
      // Check role match
      if (jdLower.includes(exp.role.toLowerCase()) || 
          exp.role.toLowerCase().includes('product') && jdLower.includes('product') ||
          exp.role.toLowerCase().includes('director') && jdLower.includes('director')) {
        relevance += 3;
      }

      // Check competency match
      exp.competencies.forEach(comp => {
        if (jdLower.includes(comp.replace('_', ' '))) {
          matchedCompetencies.add(comp);
          relevance += 2;
        }
      });

      // Check technology match
      exp.technologies.forEach(tech => {
        if (jdLower.includes(tech.toLowerCase())) {
          matchedTech.add(tech);
          relevance += 1;
        }
      });

      // Check achievements and responsibilities
      [...exp.achievements, ...exp.responsibilities].forEach(item => {
        if (this.hasKeywordMatch(item.toLowerCase(), jdLower)) {
          relevance += 1;
        }
      });

      if (relevance > 0) {
        relevantExp.push(exp);
      }
    });

    // Sort by impact level and seniority
    relevantExp.sort((a, b) => {
      const impactWeight = { high: 3, medium: 2, low: 1 };
      const seniorityWeight = { executive: 4, senior: 3, mid: 2, junior: 1 };
      
      const scoreA = impactWeight[a.impactLevel] + seniorityWeight[a.seniorityLevel];
      const scoreB = impactWeight[b.impactLevel] + seniorityWeight[b.seniorityLevel];
      
      return scoreB - scoreA;
    });

    return {
      relevantExperience: relevantExp,
      matchedCompetencies: Array.from(matchedCompetencies),
      matchedTechnologies: Array.from(matchedTech),
      relevanceScore: this.calculateRelevanceScore(relevantExp.length, matchedCompetencies.size, matchedTech.size)
    };
  }

  private hasKeywordMatch(text: string, jobDescription: string): boolean {
    const keywords = ['lead', 'manage', 'scale', 'grow', 'launch', 'develop', 'build', 'create', 'ai', 'product', 'team'];
    return keywords.some(keyword => text.includes(keyword) && jobDescription.includes(keyword));
  }

  private calculateRelevanceScore(expCount: number, compCount: number, techCount: number): number {
    // Weighted relevance score (0-100)
    const experienceScore = Math.min(expCount * 20, 60);
    const competencyScore = Math.min(compCount * 8, 25);
    const technologyScore = Math.min(techCount * 3, 15);
    
    return experienceScore + competencyScore + technologyScore;
  }

  getCareerProgression(): string[] {
    if (!this.resume) return [];
    
    return this.resume.workExperience
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .map(exp => `${exp.role} at ${exp.company} (${exp.duration})`);
  }

  getKeyMetrics(): string[] {
    const allMetrics = this.resume?.workExperience.flatMap(exp => exp.metrics) || [];
    return [...new Set(allMetrics)];
  }

  // Method to format experience for chatbot responses
  formatExperienceForChat(experience: WorkExperience): string {
    return `**${experience.role}** at **${experience.company}** (${experience.duration})
${experience.achievements.slice(0, 3).map(achievement => `• ${achievement}`).join('\n')}`;
  }

  // Method to get quick summary for chatbot intro
  getQuickSummary(): string {
    if (!this.resume) return "Resume data not available";
    
    const { summary, personalInfo } = this.resume;
    return `${personalInfo.name} is a ${summary.leadershipExperience} with ${summary.totalYearsExperience} years of experience in ${summary.industryExperience.join(', ')}. Primary expertise in ${summary.primaryExpertise.join(' and ')}.`;
  }
}