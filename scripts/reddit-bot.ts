/**
 * Reddit Bot for ProtectMyMobile
 * 
 * Uses native fetch API - no vulnerable dependencies
 * 
 * Setup:
 * 1. Go to https://www.reddit.com/prefs/apps
 * 2. Create a "script" type application
 * 3. Note the client ID (under app name) and client secret
 * 4. Add credentials to .env file
 * 
 * Usage:
 * bun run scripts/reddit-bot.ts --type=stats    # Post weekly stats
 * bun run scripts/reddit-bot.ts --type=news     # Post latest news
 * bun run scripts/reddit-bot.ts --type=tip      # Post prevention tip
 */

// Reddit API endpoints (constants, not user input)
const REDDIT_AUTH_URL = 'https://www.reddit.com/api/v1/access_token';
const REDDIT_API_BASE = 'https://oauth.reddit.com';

// Load environment variables
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const REDDIT_USERNAME = process.env.REDDIT_USERNAME;
const REDDIT_PASSWORD = process.env.REDDIT_PASSWORD;
const REDDIT_SUBREDDIT = process.env.REDDIT_SUBREDDIT || 'UKPhoneTheft';

if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET || !REDDIT_USERNAME || !REDDIT_PASSWORD) {
  console.error('Missing Reddit credentials in environment variables');
  console.error('Required: REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD');
  process.exit(1);
}

const USER_AGENT = `ProtectMyMobile Bot v2.0 (by /u/${REDDIT_USERNAME})`;

interface RedditTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface RedditSubmitResponse {
  json: {
    errors: string[][];
    data?: {
      url: string;
      id: string;
      name: string;
    };
  };
}

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(REDDIT_AUTH_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
    },
    body: new URLSearchParams({
      grant_type: 'password',
      username: REDDIT_USERNAME!,
      password: REDDIT_PASSWORD!,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as RedditTokenResponse;
  return data.access_token;
}

async function submitPost(
  accessToken: string,
  title: string,
  text: string
): Promise<{ url: string; id: string }> {
  const response = await fetch(`${REDDIT_API_BASE}/api/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
    },
    body: new URLSearchParams({
      api_type: 'json',
      kind: 'self',
      sr: REDDIT_SUBREDDIT,
      title: title,
      text: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit post: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as RedditSubmitResponse;
  
  if (data.json.errors && data.json.errors.length > 0) {
    throw new Error(`Reddit API errors: ${JSON.stringify(data.json.errors)}`);
  }

  return {
    url: data.json.data?.url || '',
    id: data.json.data?.id || '',
  };
}

// Content templates
const contentTemplates = {
  weeklyStats: () => ({
    title: `[Weekly Update] UK Phone Theft Statistics - ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    text: `
## This Week's UK Phone Theft Overview

📱 **Key Statistics (2024 Data)**
- **78,000+** snatch thefts reported across UK
- **116,000+** phones stolen in London alone
- **150%** increase compared to 2023
- Only **0.8%** result in charges

### London Hotspots
1. Westminster - 34,000+ thefts
2. Camden - 8,500+ thefts
3. Tower Hamlets - 6,200+ thefts
4. Hackney - 5,800+ thefts
5. Southwark - 4,900+ thefts

### Stay Protected
- Never use your phone while walking near roads
- Enable Find My iPhone/Android Device
- Set up a strong PIN (not 1234 or 0000)
- Consider phone insurance

🔗 **Full statistics & interactive map:** https://protectmymobile.xyz/statistics

🆘 **Phone stolen?** Follow our emergency guide: https://protectmymobile.xyz/emergency

---
*This is an automated post by the ProtectMyMobile bot. Data sourced from Met Police and ONS.*
    `.trim(),
    flair: 'Statistics',
  }),

  preventionTip: () => {
    const tips = [
      {
        title: '🛡️ Prevention Tip: The "Phone Grip" Technique',
        text: `
When using your phone in public, especially near roads:

1. **Use a phone grip or ring holder** - Makes it much harder to snatch
2. **Hold with both hands** when standing still
3. **Keep your back to walls** not to the road
4. **Stay aware** - Thieves target distracted people

Moped thieves typically target people who are:
- Walking while texting
- Standing near kerbs
- Wearing earphones (less aware)
- Holding phones loosely

**Quick security checklist:**
- [ ] Find My iPhone/Android enabled?
- [ ] Strong PIN set (not 1234)?
- [ ] Banking apps require separate login?

🔗 Full prevention guide: https://protectmymobile.xyz/prevention
        `.trim(),
      },
      {
        title: '🛡️ Prevention Tip: Secure Your Banking Apps',
        text: `
If your phone is stolen, thieves often try to access banking apps. Here's how to protect yourself:

**Essential Steps:**
1. **Use a different PIN** for banking apps than your phone unlock
2. **Enable biometric login** (Face ID/fingerprint) for all banking apps
3. **Turn off notification previews** - Thieves can see 2FA codes on lock screen
4. **Remove saved card details** from browsers

**Settings to check:**
- Settings > Notifications > Show Previews > "When Unlocked" or "Never"
- Enable "Stolen Device Protection" on iPhone (Settings > Face ID > Stolen Device Protection)

🔗 UK Bank emergency contacts: https://protectmymobile.xyz/banks
🔗 Full security guide: https://protectmymobile.xyz/prevention
        `.trim(),
      },
      {
        title: '🛡️ Prevention Tip: What To Do on Public Transport',
        text: `
The Tube, buses, and trains are prime spots for phone theft. Stay safe:

**On the Tube:**
- Keep phone in inside pocket, not back pocket
- If using phone, hold firmly with both hands
- Be extra careful near doors (thieves grab and run as doors close)
- Westminster, Oxford Circus, and Liverpool Street are hotspots

**On Buses:**
- Sit away from the doors
- Don't use phone near windows (smash-and-grab risk)
- Keep bags zipped and in front of you

**At Stations:**
- Avoid using phone on escalators
- Be aware of people standing too close

🔗 See theft hotspot map: https://protectmymobile.xyz/statistics
        `.trim(),
      },
    ];
    const tip = tips[Math.floor(Math.random() * tips.length)];
    return { ...tip, flair: 'Prevention' };
  },

  emergencyReminder: () => ({
    title: '🆘 Reminder: What To Do If Your Phone Is Stolen (5 Steps)',
    text: `
**Act within 30 minutes - every minute counts!**

## Step 1: Lock Your Device Remotely
- **iPhone:** icloud.com/find
- **Android:** google.com/android/find

## Step 2: Change Critical Passwords
From another device, change passwords for:
- Apple ID / Google Account
- Email
- Banking apps
- Social media

## Step 3: Block Your SIM
Call your provider immediately:
- EE: 150 or 07953 966 250
- Vodafone: 191 or 03333 040 191
- Three: 333 or 0333 338 1001
- O2: 202 or 0344 809 0202

## Step 4: Report to Police
- Online: police.uk
- Phone: 101
- Get a crime reference number for insurance

## Step 5: Check Bank Accounts
Monitor for suspicious transactions and call your bank's fraud line.

🔗 **Full emergency guide with all contacts:** https://protectmymobile.xyz/emergency
🔗 **UK Bank emergency numbers:** https://protectmymobile.xyz/banks

---
*Save this post - you might need it someday.*
    `.trim(),
    flair: 'Emergency Guide',
  }),

  newsShare: (newsTitle: string, newsUrl: string, summary: string) => ({
    title: `📰 ${newsTitle}`,
    text: `
${summary}

🔗 **Read full article:** ${newsUrl}

---
*Posted by ProtectMyMobile Bot. Discuss in comments.*
    `.trim(),
    flair: 'News',
  }),
};

async function postToReddit(
  title: string,
  text: string,
  flair?: string
): Promise<void> {
  try {
    console.log(`Authenticating with Reddit...`);
    const accessToken = await getAccessToken();
    
    console.log(`Posting to r/${REDDIT_SUBREDDIT}...`);
    console.log(`Title: ${title}`);

    const result = await submitPost(accessToken, title, text);

    console.log(`✅ Posted successfully!`);
    console.log(`URL: ${result.url}`);

    if (flair) {
      console.log(`Flair "${flair}" specified (set manually if not auto-applied)`);
    }
  } catch (error) {
    console.error('❌ Failed to post:', error);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const typeArg = args.find(arg => arg.startsWith('--type='));
  const postType = typeArg ? typeArg.split('=')[1] : 'stats';

  console.log(`\n🤖 ProtectMyMobile Reddit Bot (v2 - native fetch)`);
  console.log(`Subreddit: r/${REDDIT_SUBREDDIT}`);
  console.log(`Post type: ${postType}\n`);

  let content: { title: string; text: string; flair?: string };

  switch (postType) {
    case 'stats':
      content = contentTemplates.weeklyStats();
      break;
    case 'tip':
      content = contentTemplates.preventionTip();
      break;
    case 'emergency':
      content = contentTemplates.emergencyReminder();
      break;
    case 'news':
      console.log('For news posts, use: --type=news --title="..." --url="..." --summary="..."');
      const newsTitle = args.find(a => a.startsWith('--title='))?.split('=')[1];
      const newsUrl = args.find(a => a.startsWith('--url='))?.split('=')[1];
      const newsSummary = args.find(a => a.startsWith('--summary='))?.split('=')[1];
      
      if (!newsTitle || !newsUrl || !newsSummary) {
        console.error('Missing required args for news post');
        process.exit(1);
      }
      content = contentTemplates.newsShare(newsTitle, newsUrl, newsSummary);
      break;
    default:
      console.error(`Unknown post type: ${postType}`);
      console.log('Available types: stats, tip, emergency, news');
      process.exit(1);
  }

  await postToReddit(content.title, content.text, content.flair);
}

main().catch(console.error);
