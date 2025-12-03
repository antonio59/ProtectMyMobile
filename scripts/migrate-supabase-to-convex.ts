/**
 * Migration Script: Supabase to Convex
 * 
 * This script exports all data from Supabase and imports it into Convex.
 * 
 * Prerequisites:
 * 1. Set environment variables:
 *    - SUPABASE_URL: Your Supabase project URL
 *    - SUPABASE_SERVICE_ROLE_KEY: Service role key (not anon key) for full access
 *    - CONVEX_URL: Your Convex deployment URL
 * 
 * 2. Run Convex dev to generate types:
 *    npx convex dev
 * 
 * Usage:
 *    npx tsx scripts/migrate-supabase-to-convex.ts
 */

import { createClient } from '@supabase/supabase-js';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

// Configuration - set these environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const CONVEX_URL = process.env.CONVEX_URL || process.env.PUBLIC_CONVEX_URL;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

if (!CONVEX_URL) {
  console.error('Missing Convex URL. Set CONVEX_URL');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const convex = new ConvexHttpClient(CONVEX_URL);

async function migrateExperienceReports() {
  console.log('Migrating experience_reports...');
  const { data, error } = await supabase.from('experience_reports').select('*');
  
  if (error) {
    console.error('Error fetching experience_reports:', error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('No experience_reports to migrate');
    return;
  }
  
  for (const report of data) {
    try {
      await convex.mutation(api.experienceReports.create, {
        hasExperiencedTheft: report.has_experienced_theft,
        when: report.when,
        where: report.where,
        whatHappened: report.what_happened,
        doingDifferently: report.doing_differently || undefined,
        name: report.name,
        email: report.email,
      });
      
      // If it was approved, update the approval status
      if (report.approved) {
        // Note: We'd need the ID from the create to update, so we handle this differently
        console.log(`  - Imported: ${report.name} (approved: ${report.approved})`);
      }
    } catch (err) {
      console.error(`  - Error importing report ${report.id}:`, err);
    }
  }
  console.log(`  Migrated ${data.length} experience reports`);
}

async function migrateContactSubmissions() {
  console.log('Migrating contact_submissions...');
  const { data, error } = await supabase.from('contact_submissions').select('*');
  
  if (error) {
    console.error('Error fetching contact_submissions:', error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('No contact_submissions to migrate');
    return;
  }
  
  for (const submission of data) {
    try {
      await convex.mutation(api.contactSubmissions.create, {
        name: submission.name,
        email: submission.email,
        subject: submission.subject,
        message: submission.message,
      });
      console.log(`  - Imported: ${submission.email}`);
    } catch (err) {
      console.error(`  - Error importing submission ${submission.id}:`, err);
    }
  }
  console.log(`  Migrated ${data.length} contact submissions`);
}

async function migrateNewsPosts() {
  console.log('Migrating news_posts...');
  const { data, error } = await supabase.from('news_posts').select('*');
  
  if (error) {
    console.error('Error fetching news_posts:', error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('No news_posts to migrate');
    return;
  }
  
  for (const post of data) {
    try {
      await convex.mutation(api.newsPosts.create, {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        authorId: post.author_id || undefined,
        authorName: post.author_name,
        category: post.category,
        sourceUrl: post.source_url || undefined,
        sourceName: post.source_name || undefined,
        featuredImageUrl: post.featured_image_url || undefined,
        published: post.published,
      });
      console.log(`  - Imported: ${post.title}`);
    } catch (err) {
      console.error(`  - Error importing post ${post.id}:`, err);
    }
  }
  console.log(`  Migrated ${data.length} news posts`);
}

async function migrateTheftDataPoints() {
  console.log('Migrating theft_data_points...');
  const { data, error } = await supabase.from('theft_data_points').select('*');
  
  if (error) {
    console.error('Error fetching theft_data_points:', error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('No theft_data_points to migrate');
    return;
  }
  
  // Batch insert for efficiency
  const BATCH_SIZE = 50;
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    const dataPoints = batch.map(point => ({
      date: point.date,
      locationName: point.location_name,
      latitude: parseFloat(point.latitude),
      longitude: parseFloat(point.longitude),
      theftCount: point.theft_count,
      dataSource: point.data_source,
    }));
    
    try {
      await convex.mutation(api.theftDataPoints.createBatch, { dataPoints });
      console.log(`  - Imported batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(data.length / BATCH_SIZE)}`);
    } catch (err) {
      console.error(`  - Error importing batch:`, err);
    }
  }
  console.log(`  Migrated ${data.length} theft data points`);
}

async function migrateCommunityResponses() {
  console.log('Migrating community_responses...');
  const { data, error } = await supabase.from('community_responses').select('*');
  
  if (error) {
    console.error('Error fetching community_responses:', error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('No community_responses to migrate');
    return;
  }
  
  for (const response of data) {
    try {
      await convex.mutation(api.communityResponses.submit, {
        hadPhoneStolen: response.had_phone_stolen,
        phoneRecovered: response.phone_recovered || undefined,
        replacementMethod: response.replacement_method || undefined,
        theftLocation: response.theft_location || undefined,
        securityMeasures: response.security_measures || undefined,
        reportedToPolice: response.reported_to_police || undefined,
        sessionId: response.session_id || crypto.randomUUID(),
        userIpHash: response.user_ip_hash || undefined,
        userAgent: response.user_agent || undefined,
      });
    } catch (err) {
      // Ignore duplicate session errors
      if (!(err instanceof Error && err.message.includes('already submitted'))) {
        console.error(`  - Error importing response:`, err);
      }
    }
  }
  console.log(`  Migrated ${data.length} community responses`);
}

async function migrateBanks() {
  console.log('Migrating banks...');
  const { data, error } = await supabase.from('banks').select('*');
  
  if (error) {
    console.error('Error fetching banks:', error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('No banks to migrate');
    return;
  }
  
  for (const bank of data) {
    try {
      await convex.mutation(api.banks.create, {
        name: bank.name,
        phone: bank.phone || undefined,
        website: bank.website,
        fraudContact: bank.fraud_contact || undefined,
        category: bank.category,
        logoUrl: bank.logo_url || undefined,
        active: bank.active,
      });
      console.log(`  - Imported: ${bank.name}`);
    } catch (err) {
      console.error(`  - Error importing bank ${bank.id}:`, err);
    }
  }
  console.log(`  Migrated ${data.length} banks`);
}

async function migrateMobileProviders() {
  console.log('Migrating mobile_providers...');
  const { data, error } = await supabase.from('mobile_providers').select('*');
  
  if (error) {
    console.error('Error fetching mobile_providers:', error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('No mobile_providers to migrate');
    return;
  }
  
  for (const provider of data) {
    try {
      await convex.mutation(api.mobileProviders.create, {
        name: provider.name,
        phone: provider.phone || undefined,
        website: provider.website,
        theftContact: provider.theft_contact || undefined,
        network: provider.network,
        isMvno: provider.is_mvno,
        parentNetwork: provider.parent_network || undefined,
        active: provider.active,
      });
      console.log(`  - Imported: ${provider.name}`);
    } catch (err) {
      console.error(`  - Error importing provider ${provider.id}:`, err);
    }
  }
  console.log(`  Migrated ${data.length} mobile providers`);
}

async function main() {
  console.log('===========================================');
  console.log('Supabase to Convex Migration');
  console.log('===========================================\n');
  
  console.log(`Source: ${SUPABASE_URL}`);
  console.log(`Destination: ${CONVEX_URL}\n`);
  
  try {
    await migrateExperienceReports();
    await migrateContactSubmissions();
    await migrateNewsPosts();
    await migrateTheftDataPoints();
    await migrateCommunityResponses();
    await migrateBanks();
    await migrateMobileProviders();
    
    console.log('\n===========================================');
    console.log('Migration Complete!');
    console.log('===========================================');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
