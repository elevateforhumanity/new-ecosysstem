#!/usr/bin/env node

/**
 * Supabase Database Setup Script
 * Sets up the complete database schema for the EFH platform
 */

import pkg from 'pg';
const { Client } = pkg;

// Database connection - you'll need to provide the password
const DB_CONFIG = {
  host: 'db.kkzbqkyuunahdxcfdfzv.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD || 'YOUR_PASSWORD_HERE', // Replace with actual password
  ssl: { rejectUnauthorized: false }
};

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database schema...');
  
  const client = new Client(DB_CONFIG);
  
  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL database');
    
    // Create the complete schema
    const schema = `
      -- Enable necessary extensions
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
      
      -- Programs table for educational content
      CREATE TABLE IF NOT EXISTS programs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        slug TEXT UNIQUE NOT NULL,
        content JSONB,
        meta_tags JSONB,
        featured BOOLEAN DEFAULT false,
        published BOOLEAN DEFAULT true,
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Pages table for dynamic content generation
      CREATE TABLE IF NOT EXISTS pages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT,
        meta_description TEXT,
        keywords TEXT[],
        template TEXT DEFAULT 'default',
        published BOOLEAN DEFAULT true,
        priority DECIMAL(2,1) DEFAULT 0.5,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Sitemaps table for SEO management
      CREATE TABLE IF NOT EXISTS sitemaps (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        url TEXT NOT NULL UNIQUE,
        lastmod TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        changefreq TEXT DEFAULT 'weekly',
        priority DECIMAL(2,1) DEFAULT 0.5,
        page_type TEXT DEFAULT 'page',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Content blocks for modular page building
      CREATE TABLE IF NOT EXISTS content_blocks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        type TEXT NOT NULL, -- 'hero', 'text', 'image', 'cta', etc.
        content JSONB NOT NULL,
        template TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Analytics table for tracking
      CREATE TABLE IF NOT EXISTS page_analytics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        page_slug TEXT NOT NULL,
        views INTEGER DEFAULT 1,
        unique_visitors INTEGER DEFAULT 1,
        bounce_rate DECIMAL(5,2),
        avg_time_on_page INTEGER,
        date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_programs_slug ON programs(slug);
      CREATE INDEX IF NOT EXISTS idx_programs_category ON programs(category);
      CREATE INDEX IF NOT EXISTS idx_programs_published ON programs(published);
      CREATE INDEX IF NOT EXISTS idx_programs_featured ON programs(featured);
      
      CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
      CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(published);
      CREATE INDEX IF NOT EXISTS idx_pages_template ON pages(template);
      
      CREATE INDEX IF NOT EXISTS idx_sitemaps_url ON sitemaps(url);
      CREATE INDEX IF NOT EXISTS idx_sitemaps_page_type ON sitemaps(page_type);
      CREATE INDEX IF NOT EXISTS idx_sitemaps_lastmod ON sitemaps(lastmod);
      
      CREATE INDEX IF NOT EXISTS idx_content_blocks_type ON content_blocks(type);
      CREATE INDEX IF NOT EXISTS idx_content_blocks_active ON content_blocks(active);
      
      CREATE INDEX IF NOT EXISTS idx_analytics_page_slug ON page_analytics(page_slug);
      CREATE INDEX IF NOT EXISTS idx_analytics_date ON page_analytics(date);
      
      -- Create updated_at trigger function
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      -- Add triggers for updated_at
      DROP TRIGGER IF EXISTS update_programs_updated_at ON programs;
      CREATE TRIGGER update_programs_updated_at 
        BEFORE UPDATE ON programs 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
      DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
      CREATE TRIGGER update_pages_updated_at 
        BEFORE UPDATE ON pages 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;
    
    await client.query(schema);
    console.log('✅ Database schema created successfully');
    
    // Insert sample data
    await insertSampleData(client);
    
    // Create views for easy querying
    await createViews(client);
    
    console.log('🎉 Supabase database setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

async function insertSampleData(client) {
  console.log('📝 Inserting sample data...');
  
  // Insert sample programs
  const samplePrograms = `
    INSERT INTO programs (title, description, category, slug, content, meta_tags) VALUES
    ('Web Development Bootcamp', 'Comprehensive web development training program', 'Technology', 'web-development-bootcamp', 
     '{"modules": ["HTML/CSS", "JavaScript", "React", "Node.js"], "duration": "12 weeks"}',
     '{"title": "Web Development Bootcamp - Learn Full Stack Development", "description": "Master web development with our comprehensive bootcamp covering HTML, CSS, JavaScript, React, and Node.js"}'),
    
    ('Digital Marketing Certification', 'Complete digital marketing training and certification', 'Marketing', 'digital-marketing-certification',
     '{"modules": ["SEO", "Social Media", "PPC", "Analytics"], "duration": "8 weeks"}',
     '{"title": "Digital Marketing Certification - Master Online Marketing", "description": "Get certified in digital marketing with training in SEO, social media, PPC advertising, and analytics"}'),
     
    ('Data Science Fundamentals', 'Introduction to data science and analytics', 'Data Science', 'data-science-fundamentals',
     '{"modules": ["Python", "Statistics", "Machine Learning", "Visualization"], "duration": "10 weeks"}',
     '{"title": "Data Science Fundamentals - Learn Python & ML", "description": "Master data science fundamentals including Python programming, statistics, machine learning, and data visualization"}')
    
    ON CONFLICT (slug) DO NOTHING;
  `;
  
  await client.query(samplePrograms);
  
  // Insert sample pages
  const samplePages = `
    INSERT INTO pages (title, slug, content, meta_description, keywords, template) VALUES
    ('About Us', 'about', 'Learn about our mission to elevate humanity through education and technology.', 
     'Discover our mission to elevate humanity through innovative education and technology solutions.', 
     ARRAY['about', 'mission', 'education', 'technology'], 'page'),
     
    ('Contact', 'contact', 'Get in touch with our team for support and inquiries.',
     'Contact our team for support, inquiries, and partnership opportunities.',
     ARRAY['contact', 'support', 'help'], 'page'),
     
    ('Programs', 'programs', 'Explore our comprehensive educational programs and certifications.',
     'Browse our complete catalog of educational programs, bootcamps, and professional certifications.',
     ARRAY['programs', 'education', 'training', 'certification'], 'listing')
     
    ON CONFLICT (slug) DO NOTHING;
  `;
  
  await client.query(samplePages);
  
  console.log('✅ Sample data inserted');
}

async function createViews(client) {
  console.log('👁️  Creating database views...');
  
  const views = `
    -- View for published programs with analytics
    CREATE OR REPLACE VIEW published_programs AS
    SELECT 
      p.*,
      COALESCE(pa.views, 0) as total_views
    FROM programs p
    LEFT JOIN (
      SELECT page_slug, SUM(views) as views
      FROM page_analytics 
      GROUP BY page_slug
    ) pa ON p.slug = pa.page_slug
    WHERE p.published = true;
    
    -- View for sitemap generation
    CREATE OR REPLACE VIEW sitemap_urls AS
    SELECT 
      url,
      lastmod,
      changefreq,
      priority,
      page_type
    FROM sitemaps
    ORDER BY priority DESC, lastmod DESC;
    
    -- View for popular content
    CREATE OR REPLACE VIEW popular_content AS
    SELECT 
      p.title,
      p.slug,
      p.category,
      SUM(pa.views) as total_views,
      AVG(pa.avg_time_on_page) as avg_time
    FROM programs p
    JOIN page_analytics pa ON p.slug = pa.page_slug
    WHERE p.published = true
    GROUP BY p.id, p.title, p.slug, p.category
    ORDER BY total_views DESC;
  `;
  
  await client.query(views);
  console.log('✅ Database views created');
}

// Run the setup
if (process.env.SUPABASE_DB_PASSWORD) {
  setupDatabase();
} else {
  console.log('❌ Please set SUPABASE_DB_PASSWORD environment variable');
  console.log('Usage: SUPABASE_DB_PASSWORD=your_password node setup-supabase-database.js');
  process.exit(1);
}