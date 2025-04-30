// src/services/instagramCron.ts
import axios from 'axios';
import SocialAccount from '../models/socialAccount.model';
import SmmPost from '../models/smmPost.model';

const SERVICES_URL = process.env.SERVICES_URL ?? 'http://localhost:5030';

/** Normalize an Instagram post URL to its canonical /p/ or /reel/ form */
function normalizeInstagramUrl(raw: string): string {
    try {
        const u = new URL(raw);
        if (!u.hostname.includes('instagram.com')) return raw;
        const parts = u.pathname.split('/').filter(Boolean);
        if (parts[0] === 'p' || parts[0] === 'reel') {
            return `https://www.instagram.com/${parts[0]}/${parts[1]}/`;
        }
        return `https://www.instagram.com/p/${parts[0]}/`;
    } catch {
        return raw;
    }
}

/** Extract the username from an Instagram profile URL */
function extractUsername(profileUrl: string): string {
    const m = profileUrl.match(/instagram\.com\/([^\/]+)/);
    return m?.[1] || '';
}

/** One full run: fetch latest posts and save any new ones */
async function runInstagramCron() {
    console.log(`[Cron] Starting Instagram check at ${new Date().toISOString()}`);
    try {
        const accounts = await SocialAccount.find();
        for (const acct of accounts) {
            for (const linkEntry of acct.links) {
                const url = linkEntry.link;
                if (!url.includes('instagram.com')) {
                    console.log(`[Cron] Skipping non-Instagram link: ${url}`);
                    continue;
                }

                const username = extractUsername(url);
                if (!username) {
                    console.warn(`[Cron] Could not parse Instagram username from ${url}`);
                    continue;
                }

                console.log(`[Cron] Fetching last 5 posts for @${username}`);
                let postLinks: string[] = [];
                try {
                    const resp = await axios.get(`${SERVICES_URL}/get_insta_post_links`, {
                        params: { operator: username, nr: 5 },
                        timeout: 50000,
                    });
                    postLinks = resp.data.links || [];
                } catch (err: any) {
                    console.error(`[Cron] Error fetching links for @${username}:`, err.message);
                    continue;
                }

                for (const rawLink of postLinks) {
                    const link = normalizeInstagramUrl(rawLink);
                    const exists = await SmmPost.exists({ link });
                    if (exists) {
                        console.log(`[Cron] Already stored: ${link}`);
                        continue;
                    }

                    console.log(`[Cron] New post: ${link} → fetching details`);
                    try {
                        const det = (await axios.get(`${SERVICES_URL}/get_insta_post`, {
                            params: { url: link, top_comments_count: 3 },
                            timeout: 60000,
                        })).data;

                        const doc: any = {
                            account: acct.account_name,
                            link,
                            platform: 'Instagram',
                            likes: det.likes ?? det.Likes ?? null,
                            shares: det.Shares ?? null,
                            comments: det.comments_count ?? det.Comments_Count ?? null,
                            date: det.date ?? det.Date ?? null,
                            hour: det.time ?? det.Time ?? null,
                            description: det.description ?? det.Description ?? null,
                            sponsored: false,
                            tags: [],
                            category: null,
                            sub_category: null,
                            images: (det.media ?? det.Media ?? [])
                                .map((m: any) => m.image_url || m.thumbnail)
                                .filter(Boolean),
                            topcomments: det.top_comments ?? det.Top_Comments ?? [],
                        };

                        // compute weekday if date is "DD.MM.YYYY"
                        if (doc.date) {
                            const [d, m, y] = doc.date.split('.');
                            const dt = new Date(Number(y), Number(m) - 1, Number(d));
                            doc.day_of_the_week = dt
                                .toLocaleDateString('en-US', { weekday: 'long' })
                                .toLowerCase();
                        }

                        const saved = await new SmmPost(doc).save();
                        console.log(`[Cron] ✓ Saved post ${link} (id=${saved._id})`);
                    } catch (err: any) {
                        console.error(`[Cron] ✗ Failed details/save for ${link}:`, err.message);
                    }
                }
            }
        }
    } catch (err: any) {
        console.error('[Cron] Unexpected error:', err);
    }
    console.log(`[Cron] Finished Instagram check at ${new Date().toISOString()}`);
}

/** Kick off immediately, then repeat every 10 minutes */
export function startInstagramCron() {
    runInstagramCron();
    setInterval(runInstagramCron, 10 * 60 * 1000);
}
