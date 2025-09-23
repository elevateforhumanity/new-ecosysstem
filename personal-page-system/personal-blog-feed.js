#!/usr/bin/env node
/**
 * Personal Page Blog Feed System
 * Pulls content from business blog but formats for personal social media
 * Keeps personal page separate from business website
 */

import fs from 'fs';
import { execSync } from 'child_process';

class PersonalBlogFeed {
  constructor() {
    this.businessBlogAPI = 'https://elevateforhumanity.org/_functions/blog/list';
    this.personalConfig = {
      name: 'Liz Jae',
      handle: '@lizjae',
      personalBrand: 'Workforce Development Expert & Entrepreneur',
      monetizationFocus: true,
      followGrowthStrategy: 'aggressive',
      platforms: {
        instagram: {
          personal: true,
          monetized: true,
          reelsEnabled: true,
          storiesEnabled: true,
          igtv: true
        },
        tiktok: {
          personal: true,
          monetized: true,
          reelsEnabled: true
        },
        facebook: {
          personal: true,
          monetized: true,
          reelsEnabled: true
        },
        youtube: {
          personal: true,
          monetized: true,
          shortsEnabled: true
        }
      }
    };
  }

  // Transform business content for personal brand
  transformForPersonalBrand(businessPost) {
    const personalPost = {
      originalTitle: businessPost.title,
      personalTitle: this.personalizeTitle(businessPost.title),
      personalAngle: this.getPersonalAngle(businessPost),
      content: this.personalizeContent(businessPost),
      monetizationHooks: this.addMonetizationHooks(businessPost),
      followHooks: this.addFollowHooks(businessPost),
      personalHashtags: this.generatePersonalHashtags(businessPost),
      reelScript: this.generatePersonalReelScript(businessPost),
      storySequence: this.generateStorySequence(businessPost),
      callToAction: this.generatePersonalCTA(businessPost)
    };

    return personalPost;
  }

  personalizeTitle(businessTitle) {
    const personalPrefixes = [
      "How I helped",
      "Behind the scenes:",
      "Real talk about",
      "The truth about",
      "My experience with",
      "What I learned from",
      "Why I believe in",
      "The story behind"
    ];

    // Transform business titles to personal perspective
    if (businessTitle.includes('Success Story:')) {
      return businessTitle.replace('Success Story:', 'How I helped');
    }
    
    if (businessTitle.includes('New') && businessTitle.includes('Program')) {
      return `Behind the scenes: Building our ${businessTitle.replace('New ', '').replace(' Program Now Available', '')} program`;
    }

    // Default personalization
    const prefix = personalPrefixes[Math.floor(Math.random() * personalPrefixes.length)];
    return `${prefix} ${businessTitle.toLowerCase()}`;
  }

  getPersonalAngle(businessPost) {
    const angles = {
      successStory: {
        personal: "entrepreneurship",
        focus: "How I built systems that change lives",
        monetization: "My business helps people earn more",
        engagement: "Ask me how in the comments"
      },
      programUpdate: {
        personal: "business_building", 
        focus: "Creating programs that actually work",
        monetization: "This is how I scale impact and income",
        engagement: "Want to know my process?"
      },
      industryInsight: {
        personal: "thought_leadership",
        focus: "My take on workforce development",
        monetization: "Why this industry is profitable",
        engagement: "Do you agree? Let me know below"
      }
    };

    // Determine post type and return appropriate angle
    if (businessPost.tags?.includes('success-story')) {
      return angles.successStory;
    } else if (businessPost.tags?.includes('programs')) {
      return angles.programUpdate;
    } else {
      return angles.industryInsight;
    }
  }

  personalizeContent(businessPost) {
    const angle = this.getPersonalAngle(businessPost);
    
    return {
      hook: this.generatePersonalHook(businessPost, angle),
      story: this.personalizeStory(businessPost, angle),
      value: this.extractPersonalValue(businessPost, angle),
      social_proof: this.addPersonalSocialProof(businessPost),
      cta: this.generatePersonalCTA(businessPost, angle)
    };
  }

  generatePersonalHook(businessPost, angle) {
    const hooks = {
      entrepreneurship: [
        "I just helped another person completely change their life 👇",
        "This is what happens when you invest in people 💪",
        "From struggling to thriving - here's the real story:",
        "Want to see what's possible? This will inspire you:"
      ],
      business_building: [
        "Building programs that actually work isn't easy, but here's how I do it:",
        "The behind-the-scenes of creating life-changing education:",
        "This is how I scale impact while building a profitable business:",
        "Want to know the secret to sustainable workforce development?"
      ],
      thought_leadership: [
        "Hot take: The workforce development industry is doing it wrong 🔥",
        "After years in this industry, here's what I've learned:",
        "Everyone talks about job training, but here's what really matters:",
        "The uncomfortable truth about career change programs:"
      ]
    };

    const categoryHooks = hooks[angle.personal] || hooks.thought_leadership;
    return categoryHooks[Math.floor(Math.random() * categoryHooks.length)];
  }

  personalizeStory(businessPost, angle) {
    // Extract key story elements and add personal perspective
    const personalPerspective = {
      role: "As the founder of Elevate for Humanity,",
      experience: "I've seen firsthand how the right training changes everything.",
      philosophy: "My approach is different - I focus on real results, not just certificates.",
      results: "That's why our graduates don't just get jobs, they build careers."
    };

    return {
      opening: personalPerspective.role,
      context: personalPerspective.experience,
      differentiation: personalPerspective.philosophy,
      outcome: personalPerspective.results,
      story_details: this.extractStoryDetails(businessPost)
    };
  }

  addMonetizationHooks(businessPost) {
    return {
      direct: [
        "DM me 'READY' if you want to change your career",
        "Link in bio for free career assessment",
        "Comment 'INFO' for program details",
        "Ready to invest in yourself? Let's talk 👇"
      ],
      soft: [
        "This is why I love what I do",
        "Building this business has been incredible",
        "Helping people earn more while I grow my impact",
        "Profitable business + life-changing results = my sweet spot"
      ],
      social_proof: [
        "98% job placement rate speaks for itself",
        "Average salary increase: $25K+",
        "Over 500 lives changed and counting",
        "From $0 to $65K+ in 8 months - this is what's possible"
      ]
    };
  }

  addFollowHooks(businessPost) {
    return {
      value_promise: [
        "Follow for more workforce development insights",
        "I share the real behind-the-scenes of building this business",
        "Daily tips on career change and entrepreneurship",
        "Follow me for honest takes on the education industry"
      ],
      curiosity: [
        "More success stories coming this week",
        "Tomorrow I'm sharing my biggest business mistake",
        "Next post: How I built a 7-figure workforce development company",
        "Follow to see how this story ends"
      ],
      community: [
        "Join 10K+ people changing their careers",
        "Be part of the workforce revolution",
        "Follow for daily motivation and real results",
        "Connect with other career changers in my community"
      ]
    };
  }

  generatePersonalHashtags(businessPost) {
    const personalHashtags = {
      base: ['#LizJae', '#WorkforceDevelopment', '#CareerChange', '#Entrepreneur'],
      monetization: ['#BusinessOwner', '#WomenInBusiness', '#ProfitWithPurpose', '#ScaleImpact'],
      engagement: ['#AskMeAnything', '#RealTalk', '#BehindTheScenes', '#Authentic'],
      niche: ['#WIOATraining', '#JobPlacement', '#SkillsTraining', '#CareerCoach'],
      trending: ['#MotivationMonday', '#TransformationTuesday', '#WisdomWednesday', '#ThrowbackThursday', '#FeatureFriday']
    };

    // Combine relevant hashtags based on post content
    const combined = [
      ...personalHashtags.base,
      ...personalHashtags.monetization.slice(0, 2),
      ...personalHashtags.engagement.slice(0, 1),
      ...personalHashtags.niche.slice(0, 2)
    ];

    // Add day-specific hashtag
    const today = new Date().getDay();
    const dayHashtags = personalHashtags.trending;
    if (dayHashtags[today]) {
      combined.push(dayHashtags[today]);
    }

    return combined.slice(0, 25); // Instagram limit
  }

  generatePersonalReelScript(businessPost) {
    const angle = this.getPersonalAngle(businessPost);
    
    const reelTemplates = {
      successStory: {
        hook: "POV: You just helped someone go from unemployed to $65K",
        scenes: [
          { duration: 2, text: "Student walks in nervous", visual: "before_photo" },
          { duration: 3, text: "8 months of training", visual: "classroom_montage" },
          { duration: 2, text: "Graduation day", visual: "celebration" },
          { duration: 3, text: "First day at new job", visual: "professional_photo" },
          { duration: 2, text: "This is why I do what I do", visual: "personal_reflection" }
        ],
        music: "motivational_upbeat",
        cta: "DM me if you're ready to change your life"
      },
      businessBuilding: {
        hook: "How I built a program that changes lives",
        scenes: [
          { duration: 2, text: "Started with an idea", visual: "planning_session" },
          { duration: 3, text: "Researched industry needs", visual: "data_analysis" },
          { duration: 3, text: "Built curriculum", visual: "content_creation" },
          { duration: 2, text: "Launched program", visual: "first_class" },
          { duration: 3, text: "98% job placement rate", visual: "success_stats" }
        ],
        music: "inspiring_build",
        cta: "Follow for more business building tips"
      },
      thoughtLeadership: {
        hook: "The workforce development industry needs to change",
        scenes: [
          { duration: 3, text: "Most programs focus on certificates", visual: "certificate_pile" },
          { duration: 3, text: "But employers want skills", visual: "job_requirements" },
          { duration: 3, text: "That's why I built different", visual: "hands_on_training" },
          { duration: 3, text: "Real skills = real jobs", visual: "employment_success" }
        ],
        music: "confident_professional",
        cta: "Agree? Let me know in the comments"
      }
    };

    return reelTemplates[angle.personal] || reelTemplates.thoughtLeadership;
  }

  generateStorySequence(businessPost) {
    return {
      story1: {
        type: "text",
        content: "New blog post is live 👆",
        duration: 5,
        background: "gradient_brand"
      },
      story2: {
        type: "behind_scenes",
        content: "The real story behind this post...",
        duration: 10,
        background: "office_photo"
      },
      story3: {
        type: "poll",
        question: "Have you ever completely changed careers?",
        options: ["Yes, best decision ever", "No, but thinking about it"],
        duration: 15
      },
      story4: {
        type: "cta",
        content: "DM me 'BLOG' for the full story",
        duration: 10,
        background: "call_to_action_graphic"
      }
    };
  }

  generatePersonalCTA(businessPost, angle) {
    const ctas = {
      direct_monetization: [
        "Ready to change your career? DM me 'READY'",
        "Link in bio for free career assessment",
        "Comment 'START' if you want to learn more",
        "Book a free call - link in bio"
      ],
      engagement_building: [
        "What's your biggest career challenge? Tell me below 👇",
        "Share this if you know someone who needs to see it",
        "Save this post for when you're ready to make a change",
        "Tag someone who's thinking about a career change"
      ],
      follow_building: [
        "Follow @lizjae for more career change content",
        "Turn on notifications so you don't miss my posts",
        "Follow for daily workforce development insights",
        "Join 10K+ people transforming their careers"
      ]
    };

    // Rotate CTAs for variety
    const allCtas = [...ctas.direct_monetization, ...ctas.engagement_building, ...ctas.follow_building];
    return allCtas[Math.floor(Math.random() * allCtas.length)];
  }

  // Generate content for different platforms
  async generatePersonalContent(businessPostId) {
    try {
      // Fetch business post (in production, this would be an API call)
      const businessPost = await this.fetchBusinessPost(businessPostId);
      
      if (!businessPost) {
        console.error('Business post not found');
        return null;
      }

      // Transform for personal brand
      const personalPost = this.transformForPersonalBrand(businessPost);

      // Generate platform-specific content
      const platformContent = {
        instagram: {
          feed_post: this.generateInstagramPost(personalPost),
          reel: this.generateInstagramReel(personalPost),
          stories: this.generateInstagramStories(personalPost)
        },
        tiktok: {
          video: this.generateTikTokVideo(personalPost)
        },
        facebook: {
          post: this.generateFacebookPost(personalPost),
          reel: this.generateFacebookReel(personalPost)
        },
        youtube: {
          short: this.generateYouTubeShort(personalPost)
        }
      };

      return {
        personal_post: personalPost,
        platform_content: platformContent,
        scheduling: this.generatePostingSchedule(),
        analytics_tracking: this.generateAnalyticsConfig()
      };

    } catch (error) {
      console.error('Error generating personal content:', error);
      return null;
    }
  }

  generateInstagramPost(personalPost) {
    const maxLength = 2200;
    
    let content = `${personalPost.content.hook}\n\n`;
    content += `${personalPost.content.story.opening} ${personalPost.content.story.context}\n\n`;
    content += `${personalPost.content.story.differentiation}\n\n`;
    content += `${personalPost.content.social_proof}\n\n`;
    content += `${personalPost.callToAction}\n\n`;
    content += personalPost.personalHashtags.join(' ');

    // Truncate if too long
    if (content.length > maxLength) {
      content = content.substring(0, maxLength - 3) + '...';
    }

    return {
      content: content,
      image_specs: { width: 1080, height: 1080 },
      engagement_strategy: "Post during peak hours (6-9 PM EST)",
      monetization_note: "Include link in bio for direct conversion"
    };
  }

  generateInstagramReel(personalPost) {
    const reelScript = personalPost.reelScript;
    
    return {
      script: reelScript,
      duration: reelScript.scenes.reduce((total, scene) => total + scene.duration, 0),
      music: reelScript.music,
      hashtags: personalPost.personalHashtags.slice(0, 5), // Fewer hashtags for reels
      caption: `${personalPost.content.hook}\n\n${reelScript.cta}\n\n${personalPost.personalHashtags.slice(0, 10).join(' ')}`,
      engagement_strategy: "Post reels 3-4 times per week for maximum reach"
    };
  }

  generateTikTokVideo(personalPost) {
    const reelScript = personalPost.reelScript;
    
    return {
      script: reelScript,
      vertical_format: true,
      duration: Math.min(reelScript.scenes.reduce((total, scene) => total + scene.duration, 0), 60),
      hashtags: personalPost.personalHashtags.slice(0, 5),
      caption: `${personalPost.content.hook} ${reelScript.cta}`,
      trending_sounds: true,
      engagement_strategy: "Post daily for algorithm boost"
    };
  }

  generatePostingSchedule() {
    return {
      instagram: {
        feed_posts: "Daily at 7 PM EST",
        reels: "3x per week (Mon, Wed, Fri) at 6 PM EST",
        stories: "2-3x daily"
      },
      tiktok: {
        videos: "Daily at 8 PM EST"
      },
      facebook: {
        posts: "5x per week at 1 PM EST",
        reels: "2x per week"
      },
      youtube: {
        shorts: "Daily at 9 AM EST"
      }
    };
  }

  generateAnalyticsConfig() {
    return {
      kpis: {
        follower_growth: "Target: 1000 new followers per month",
        engagement_rate: "Target: 5%+ average engagement",
        monetization: "Track DMs, link clicks, conversion rate",
        reach: "Target: 100K+ monthly reach"
      },
      tracking: {
        utm_parameters: true,
        conversion_tracking: true,
        audience_insights: true,
        competitor_analysis: true
      }
    };
  }

  async fetchBusinessPost(postId) {
    // Mock business post - in production, fetch from actual blog API
    return {
      id: postId,
      title: "Success Story: Sarah Johnson Achieves $65K Healthcare Career",
      excerpt: "Meet Sarah Johnson, who transformed her career through our Medical Assistant program.",
      content: "Full blog post content here...",
      tags: ['success-story', 'medical-assistant', 'career-change'],
      author: 'Liz Jae',
      publishedAt: new Date().toISOString()
    };
  }

  extractStoryDetails(businessPost) {
    // Extract key details from business post for personal storytelling
    return {
      student_name: this.extractStudentName(businessPost),
      program: this.extractProgram(businessPost),
      outcome: this.extractOutcome(businessPost),
      timeline: this.extractTimeline(businessPost)
    };
  }

  extractStudentName(post) {
    const match = post.title.match(/Success Story: ([^A-Z]+)/);
    return match ? match[1].trim() : 'One of our students';
  }

  extractProgram(post) {
    const programs = ['Medical Assistant', 'IT Support', 'HVAC', 'Welding', 'Nursing'];
    return programs.find(program => post.content.includes(program)) || 'our program';
  }

  extractOutcome(post) {
    const salaryMatch = post.content.match(/\$(\d+[,\d]*)/);
    return salaryMatch ? `$${salaryMatch[1]} career` : 'new career';
  }

  extractTimeline(post) {
    const timeMatch = post.content.match(/(\d+)\s+(months?|weeks?)/);
    return timeMatch ? `${timeMatch[1]} ${timeMatch[2]}` : 'several months';
  }
}

// CLI interface
const command = process.argv[2];
const postId = process.argv[3];

if (command === 'generate' && postId) {
  const personalFeed = new PersonalBlogFeed();
  personalFeed.generatePersonalContent(postId).then(result => {
    if (result) {
      console.log('✅ Personal content generated successfully');
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.error('❌ Failed to generate personal content');
    }
  });
} else if (command === 'test') {
  const personalFeed = new PersonalBlogFeed();
  personalFeed.generatePersonalContent('test-post-123').then(result => {
    console.log('🧪 Test personal content generated');
    console.log(JSON.stringify(result, null, 2));
  });
} else {
  console.log(`
Personal Page Blog Feed System

Usage:
  node personal-blog-feed.js generate <business-post-id>
  node personal-blog-feed.js test

Features:
  ✅ Transforms business content for personal brand
  ✅ Generates platform-specific content
  ✅ Includes monetization hooks
  ✅ Optimizes for follower growth
  ✅ Separates personal from business website

Examples:
  node personal-blog-feed.js generate blog-post-456
  node personal-blog-feed.js test
`);
}

export default PersonalBlogFeed;