import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { ResumeProcessor, type ProcessedResume } from '../lib/resume-processor.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function processResume() {
  try {
    console.log('🚀 Starting resume processing...');
    
    const processor = new ResumeProcessor();
    
    // Roy's resume data (extracted from PDF)
    const resumeData = {
      name: "Roy Lo",
      contact: {
        location: "Bay Area (Stanford GSB)",
        email: "roylo@stanford.edu",
        phone: "+1 650 334 7692",
        linkedin: "linkedin.com/in/roylo0620",
        website: "roylo.fun"
      },
      workAuthorization: "Eligible to work in the U.S. under F-1 OPT through July 2026; STEM background",
      languages: ["Mandarin (Fluent)", "English (Fluent)", "Japanese (Basic)"],
      experience: [
        {
          company: "Appier Inc.",
          description: "Full funnel Enterprise AI solutions",
          role: "Director → Senior Director of Product Management",
          location: "Taipei",
          period: "Jun '21 – May '24",
          highlights: [
            "Owned $XX m P&L across 2 enterprise product lines, contributing XX% of company revenue",
            "Expanded enterprise client base by XXX% through integrations with Instagram, WhatsApp, LINE, and more",
            "Penetrated Japan (10 clients), Korea (13), and SEA (5), driving 40%+ YoY recurring revenue growth",
            "Launched LLM-powered 'copilot' feature in 2 weeks, achieving >50% client adoption",
            "Initiated and launched AI automation across 3 product lines from scratch",
            "Managed 14-person cross-functional org: 5 PMs (2 senior, 2 junior, 1 director), designers, engineers",
            "Maintained a stable, high-performing team with 90% annual retention during leadership tenure"
          ]
        },
        {
          company: "BotBonnie",
          description: "Conversational marketing automation SaaS (Acquired by Appier)",
          role: "Co-Founder & CEO",
          location: "Taipei",
          period: "Oct '16 – Jun '21",
          highlights: [
            "Bootstrapped to $X m ARR with 75% gross margin and XXX+ enterprise clients (Audi, Uniqlo, GSK)",
            "Led product, engineering, and GTM execution; personally built and launched the MVP",
            "Selected as Facebook F8 successful case study and recognized by Google Business Messages with an Innovation Award",
            "Scaled team from 4 to 18 in 2 years with < 3-month onboarding ramp",
            "Maintained 90%+ annual employee retention in a high-churn market",
            "Introduced OKRs and quarterly review cycles; scored 85/100 in company-wide leadership survey"
          ]
        },
        {
          company: "Fitribe",
          description: "Consumer wellness social and gamification app",
          role: "Co-Founder & CEO",
          location: "Taipei",
          period: "Dec '15 – Oct '16",
          highlights: [
            "Built and launched MVP within 3 months and reached XXK MAU",
            "Featured by App Store as a local creative app",
            "Introduced gamification mechanics for group accountability and feature unlocks, boosting user engagement by 50%",
            "Conducted 30+ user interviews to refine product direction and validate potential revenue models"
          ]
        },
        {
          company: "Darwin Venture Management",
          description: "VC firm backing early startups in TW, JP and US",
          role: "Entrepreneur in Residence",
          location: "Taipei",
          period: "Feb '24 – May '24",
          highlights: [
            "Evaluated 10+ AI and MarTech startups",
            "Advised on product-market fit, GTM, and platform strategies"
          ]
        },
        {
          company: "Yahoo! & IntoWow",
          description: "Ad tech and consumer platforms",
          role: "Senior Software Engineer & TPM",
          location: "Taipei",
          period: "2011 – 2015",
          highlights: [
            "Built iOS SDK serving 1M+ mobile video ads/day, improving CTR by XX%",
            "Developed fraud detection system reducing abuse by 95%; co-authored a patent"
          ]
        }
      ],
      education: [
        {
          institution: "Stanford Graduate School of Business",
          degree: "Master of Science in Management",
          program: "Sloan Fellow",
          location: "Palo Alto",
          period: "Jul '24 – Jun '25"
        },
        {
          institution: "National Yang Ming Chiao Tung University",
          degree: "M.S.",
          field: "Multimedia Engineering in Computer Science department",
          location: "Hsinchu, Taiwan",
          period: "2004 – 2010",
          honors: "Valedictorian"
        },
        {
          institution: "National Yang Ming Chiao Tung University",
          degree: "B.S.",
          field: "Computer Science",
          location: "Hsinchu, Taiwan",
          period: "2004 – 2010",
          honors: "Dean's List"
        }
      ],
      skills: {
        technical: ["NodeJS", "React", "AWS", "SQL", "Jira", "R (beginner)", "Google Analytics"],
        languages: ["Mandarin (Fluent)", "English (Fluent)", "Japanese (Basic)"]
      }
    };

    // Process the resume
    const processedResume: ProcessedResume = await processor.processResume(resumeData);

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'data', 'knowledge-base', 'resume');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write processed resume
    const resumePath = path.join(outputDir, 'processed-resume.json');
    fs.writeFileSync(resumePath, JSON.stringify(processedResume, null, 2));
    
    console.log('✅ Resume processing complete!');
    console.log(`📄 Processed resume saved to: ${resumePath}`);
    console.log(`💼 Total experience: ${processedResume.summary.totalYearsExperience} years`);
    console.log(`🎯 Primary expertise: ${processedResume.summary.primaryExpertise.join(', ')}`);
    console.log(`🏢 Industry experience: ${processedResume.summary.industryExperience.join(', ')}`);
    console.log(`🔧 Competencies identified: ${Object.keys(processedResume.competencyProfile).length}`);

  } catch (error) {
    console.error('❌ Resume processing failed:', error);
    process.exit(1);
  }
}

// Run the processing
processResume();