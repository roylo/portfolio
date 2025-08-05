import OpenAI from 'openai';

interface AIEnhancedData {
  summary?: {
    primaryExpertise?: string[];
    industryExperience?: string[];
    leadershipExperience?: string;
    technicalBackground?: string;
    keyAchievements?: string[];
  };
  competencyProfile?: Record<string, {
    strength: number;
    examples: string[];
    evidenceType: 'direct' | 'derived';
  }>;
}

export interface WorkExperience {
  company: string;
  role: string;
  department?: string;
  location: string;
  startDate: string;
  endDate: string;
  duration: string;
  responsibilities: string[];
  achievements: string[];
  metrics: string[];
  technologies: string[];
  teamSize?: string;
  reportingStructure?: string;
  keyProjects: string[];
  competencies: string[];
  impactLevel: 'low' | 'medium' | 'high';
  seniorityLevel: 'junior' | 'mid' | 'senior' | 'executive';
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string[];
  relevantCoursework?: string[];
  activities?: string[];
}

export interface Skill {
  category: string;
  skills: string[];
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface ProcessedResume {
  personalInfo: {
    name: string;
    location: string;
    email: string;
    phone: string;
    linkedin: string;
    website: string;
    workAuthorization?: string;
    languages: string[];
  };
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  summary: {
    totalYearsExperience: number;
    primaryExpertise: string[];
    industryExperience: string[];
    leadershipExperience: string;
    technicalBackground: string;
    keyAchievements: string[];
  };
  competencyProfile: {
    [competency: string]: {
      strength: number; // 1-10
      examples: string[]; // references to specific experiences
      evidenceType: 'direct' | 'derived';
    };
  };
  metadata: {
    processedAt: string;
    version: string;
  };
}

export class ResumeProcessor {
  private openai?: OpenAI;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async processResume(resumeData: Record<string, unknown>): Promise<ProcessedResume> {
    // Extract basic information using rule-based approach
    const ruleBasedData = this.extractRuleBasedData();
    
    // Enhance with AI analysis
    const aiEnhancedData = await this.enhanceWithAI(resumeData, ruleBasedData);
    
    // Combine and validate
    return this.combineAndValidate(ruleBasedData, aiEnhancedData);
  }

  private extractRuleBasedData() {
    // Rule-based extraction logic
    return {
      personalInfo: {
        name: "Roy Lo",
        location: "Bay Area (Stanford GSB)",
        email: "roylo@stanford.edu",
        phone: "+1 650 334 7692",
        linkedin: "linkedin.com/in/roylo0620",
        website: "roylo.fun",
        workAuthorization: "Eligible to work in the U.S. under F-1 OPT through July 2026; STEM background",
        languages: ["Mandarin", "English", "Japanese (basic)"]
      },
      workExperience: [
        {
          company: "Appier Inc.",
          role: "Director → Senior Director of Product Management",
          department: "Product",
          location: "Taipei",
          startDate: "2021-06",
          endDate: "2024-05",
          duration: "2 years 11 months",
          responsibilities: [
            "Owned $XX m P&L across 2 enterprise product lines",
            "Managed 14-person cross-functional org: 5 PMs, designers, engineers",
            "Conducted quarterly performance reviews for 10+ direct and cross-functional team members"
          ],
          achievements: [
            "Contributing XX% of company revenue",
            "Expanded enterprise client base by XXX%",
            "Penetrated Japan (10 clients), Korea (13), and SEA (5)",
            "Driving 40%+ YoY recurring revenue growth",
            "Launched LLM-powered 'copilot' feature in 2 weeks, achieving >50% client adoption",
            "Recovered $XXX K in at-risk ARR within beta stage",
            "Maintained 90% annual retention during leadership tenure"
          ],
          metrics: ["$XX m P&L", "XX% revenue", "XXX% client growth", "40%+ YoY growth", ">50% adoption", "$XXX K ARR"],
          technologies: ["LLM", "AI", "Instagram", "WhatsApp", "LINE", "SMS", "EDM", "Web", "App"],
          teamSize: "14-person cross-functional org",
          keyProjects: ["LLM-powered copilot feature", "AI automation across 3 product lines", "Omnichannel marketing solutions"],
          competencies: ["leadership", "product_management", "growth", "technical", "international"],
          impactLevel: "high" as const,
          seniorityLevel: "executive" as const
        },
        {
          company: "BotBonnie",
          role: "Co-Founder & CEO",
          department: "Executive",
          location: "Taipei",
          startDate: "2016-10",
          endDate: "2021-06",
          duration: "4 years 8 months",
          responsibilities: [
            "Led product, engineering, and GTM execution",
            "Personally built and launched the MVP",
            "Scaled team from 4 to 18 in 2 years"
          ],
          achievements: [
            "Bootstrapped to $X m ARR with 75% gross margin",
            "XXX+ enterprise clients (Audi, Uniqlo, GSK)",
            "Selected as Facebook F8 successful case study",
            "Recognized by Google Business Messages with an Innovation Award",
            "Maintained 90%+ annual employee retention",
            "Scored 85/100 in company-wide leadership survey"
          ],
          metrics: ["$X m ARR", "75% gross margin", "XXX+ clients", "90%+ retention", "85/100 leadership score"],
          technologies: ["Conversational AI", "SaaS", "Marketing automation"],
          teamSize: "18 people",
          keyProjects: ["MVP development", "Enterprise client acquisition", "Culture building"],
          competencies: ["leadership", "product_management", "innovation", "growth", "culture_building"],
          impactLevel: "high" as const,
          seniorityLevel: "executive" as const
        },
        {
          company: "Fitribe",
          role: "Co-Founder & CEO",
          department: "Executive",
          location: "Taipei",
          startDate: "2015-12",
          endDate: "2016-10",
          duration: "10 months",
          responsibilities: [
            "Built and launched MVP within 3 months",
            "Conducted 30+ user interviews"
          ],
          achievements: [
            "Reached XXK MAU",
            "Featured by App Store as a local creative app",
            "Boosted user engagement by 50%"
          ],
          metrics: ["XXK MAU", "50% engagement boost", "30+ interviews"],
          technologies: ["Mobile app", "Gamification"],
          keyProjects: ["MVP launch", "Gamification mechanics", "User research"],
          competencies: ["product_management", "innovation", "user_experience_design"],
          impactLevel: "medium" as const,
          seniorityLevel: "executive" as const
        },
        {
          company: "Darwin Venture Management",
          role: "Entrepreneur in Residence",
          department: "Investment",
          location: "Taipei",
          startDate: "2024-02",
          endDate: "2024-05",
          duration: "3 months",
          responsibilities: [
            "Evaluated 10+ AI and MarTech startups",
            "Advised on product-market fit, GTM, and platform strategies"
          ],
          achievements: [],
          metrics: ["10+ startups"],
          technologies: ["AI", "MarTech"],
          keyProjects: ["Startup evaluation", "Strategic advisory"],
          competencies: ["strategic_thinking", "market_analysis", "mentorship"],
          impactLevel: "medium" as const,
          seniorityLevel: "executive" as const
        },
        {
          company: "Yahoo! & IntoWow",
          role: "Senior Software Engineer & TPM",
          department: "Engineering",
          location: "Taipei",
          startDate: "2011-01",
          endDate: "2015-12",
          duration: "4 years 11 months",
          responsibilities: [
            "Built iOS SDK serving 1M+ mobile video ads/day",
            "Developed fraud detection system"
          ],
          achievements: [
            "Improving CTR by XX%",
            "Reducing abuse by 95%",
            "Co-authored a patent"
          ],
          metrics: ["1M+ ads/day", "XX% CTR improvement", "95% abuse reduction"],
          technologies: ["iOS", "SDK", "Ad tech", "Fraud detection"],
          keyProjects: ["iOS SDK development", "Fraud detection system", "Patent"],
          competencies: ["technical", "data_analysis", "innovation"],
          impactLevel: "medium" as const,
          seniorityLevel: "senior" as const
        }
      ],
      education: [
        {
          institution: "Stanford Graduate School of Business",
          degree: "Master of Science in Management",
          field: "Sloan Fellow",
          location: "Palo Alto",
          startDate: "2024-07",
          endDate: "2025-06",
          honors: ["Current Student"]
        },
        {
          institution: "National Yang Ming Chiao Tung University",
          degree: "M.S.",
          field: "Multimedia Engineering in Computer Science department",
          location: "Hsinchu, Taiwan",
          startDate: "2004-01",
          endDate: "2010-12",
          honors: ["Valedictorian"]
        },
        {
          institution: "National Yang Ming Chiao Tung University",
          degree: "B.S.",
          field: "Computer Science",
          location: "Hsinchu, Taiwan",
          startDate: "2004-01",
          endDate: "2010-12",
          honors: ["Dean's List"]
        }
      ],
      skills: [
        {
          category: "Programming Languages",
          skills: ["NodeJS", "React"],
          proficiencyLevel: "advanced" as const
        },
        {
          category: "Cloud & Infrastructure",
          skills: ["AWS"],
          proficiencyLevel: "intermediate" as const
        },
        {
          category: "Data & Analytics",
          skills: ["SQL", "R", "Google Analytics"],
          proficiencyLevel: "intermediate" as const
        },
        {
          category: "Project Management",
          skills: ["Jira"],
          proficiencyLevel: "advanced" as const
        }
      ]
    };
  }

  private async enhanceWithAI(_resumeData: Record<string, unknown>, ruleBasedData: Record<string, unknown>): Promise<AIEnhancedData> {
    if (!this.openai) {
      console.log('No OpenAI API key provided, skipping AI enhancement');
      return {};
    }

    const prompt = `Analyze this resume data and provide enhanced insights:

Resume Data: ${JSON.stringify(ruleBasedData, null, 2)}

Please provide a JSON response with the following structure:
{
  "summary": {
    "totalYearsExperience": number,
    "primaryExpertise": ["area1", "area2"],
    "industryExperience": ["industry1", "industry2"],
    "leadershipExperience": "description",
    "technicalBackground": "description",
    "keyAchievements": ["achievement1", "achievement2"]
  },
  "competencyProfile": {
    "competency_name": {
      "strength": number (1-10),
      "examples": ["experience reference"],
      "evidenceType": "direct" | "derived"
    }
  },
  "careerProgression": {
    "trajectory": "description",
    "growthAreas": ["area1", "area2"],
    "uniqueStrengths": ["strength1", "strength2"]
  }
}

Focus on extracting quantifiable achievements, leadership progression, and technical depth.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      const aiData = JSON.parse(response.choices[0].message.content || '{}');
      return aiData;
    } catch (error) {
      console.error('AI enhancement failed:', error);
      return {};
    }
  }

  private combineAndValidate(ruleBasedData: Record<string, unknown>, aiEnhancedData: AIEnhancedData): ProcessedResume {
    
    return {
      personalInfo: ruleBasedData.personalInfo as ProcessedResume['personalInfo'],
      workExperience: ruleBasedData.workExperience as WorkExperience[],
      education: ruleBasedData.education as ProcessedResume['education'],
      skills: ruleBasedData.skills as ProcessedResume['skills'],
      summary: {
        totalYearsExperience: this.calculateTotalExperience(),
        primaryExpertise: aiEnhancedData.summary?.primaryExpertise || ["Product Management", "Leadership", "AI/ML"],
        industryExperience: aiEnhancedData.summary?.industryExperience || ["SaaS", "Enterprise Software", "Ad Tech"],
        leadershipExperience: aiEnhancedData.summary?.leadershipExperience || "10+ years leading cross-functional teams",
        technicalBackground: aiEnhancedData.summary?.technicalBackground || "Strong engineering foundation with product leadership",
        keyAchievements: aiEnhancedData.summary?.keyAchievements || [
          "Built and scaled SaaS business to $X m ARR",
          "Led successful acquisition by public company",
          "Managed $XX m P&L across enterprise product lines"
        ]
      },
      competencyProfile: aiEnhancedData.competencyProfile || this.generateDefaultCompetencies(ruleBasedData.workExperience as WorkExperience[]) as ProcessedResume['competencyProfile'],
      metadata: {
        processedAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }

  private calculateTotalExperience(): number {
    // Calculate from first job to most recent
    const firstJob = new Date('2011-01-01');
    const lastJob = new Date('2024-05-01');
    return Math.floor((lastJob.getTime() - firstJob.getTime()) / (1000 * 60 * 60 * 24 * 365));
  }

  private generateDefaultCompetencies(workExperience: WorkExperience[]): Record<string, unknown> {
    const competencies: Record<string, { strength: number; examples: string[]; evidenceType: string }> = {};
    
    // Extract all competencies from work experience
    workExperience.forEach(exp => {
      exp.competencies.forEach(comp => {
        if (!competencies[comp]) {
          competencies[comp] = {
            strength: 1,
            examples: [],
            evidenceType: 'direct'
          };
        }
        competencies[comp].strength += 1;
        competencies[comp].examples.push(`${exp.company} - ${exp.role}`);
      });
    });

    // Cap strength at 10
    Object.keys(competencies).forEach(comp => {
      competencies[comp].strength = Math.min(competencies[comp].strength, 10);
    });

    return competencies;
  }
}