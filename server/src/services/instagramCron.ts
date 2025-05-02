// src/services/instagramCron.ts
import axios from "axios";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import SocialAccount from "../models/socialAccount.model";
import SmmPost from "../models/smmPost.model";

const MICROSERVICE_URL = process.env.SERVICES_URL ?? "http://localhost:5030";
// where to save downloaded images
const INSTA_DIR = path.join(__dirname, "../../insta");

// ensure insta folder exists
if (!fs.existsSync(INSTA_DIR)) {
    fs.mkdirSync(INSTA_DIR, { recursive: true });
}

function normalizeInstagramUrl(raw: string): string {
    try {
        const u = new URL(raw);
        const parts = u.pathname.split('/').filter(Boolean);
        if (parts[0] === "p" || parts[0] === "reel") {
            return `https://www.instagram.com/${parts[0]}/${parts[1]}/`;
        }
        return `https://www.instagram.com/p/${parts[0]}/`;
    } catch {
        return raw;
    }
}

function convertReelToP(url: string): string {
    return url.replace("/reel/", "/p/");
}

function extractUsername(profileUrl: string): string | null {
    const m = profileUrl.match(/instagram\.com\/([^\/]+)/);
    return m ? m[1] : null;
}

async function downloadMedia(url: string): Promise<string|null> {
    try {
        const ext = path.extname(url.split("?")[0]) || ".jpg";
        const name = uuidv4() + ext;
        const filepath = path.join(INSTA_DIR, name);
        const resp = await axios.get(url, { responseType: "arraybuffer", headers: { "User-Agent": "Mozilla/5.0" }});
        fs.writeFileSync(filepath, resp.data);
        return `/insta/${name}`;
    } catch (err) {
        console.error("[Cron] Failed to download", url, err.message);
        return null;
    }
}

async function runInstagramCron() {
    console.log(`[Cron] Start @ ${new Date().toISOString()}`);
    let accounts;
    try {
        accounts = await SocialAccount.find();
    } catch (err) {
        return console.error("[Cron] Load accounts failed:", err);
    }

    for (const acct of accounts) {
        for (const linkEntry of acct.links) {
            const profileUrl = linkEntry.link;
            if (!profileUrl.includes("instagram.com")) continue;
            const username = extractUsername(profileUrl);
            if (!username) continue;

            console.log(`[Cron] Fetching last 5 for @${username}`);
            let postLinks: string[] = [];
            try {
                const r = await axios.get(`${MICROSERVICE_URL}/get_insta_post_links`, {
                    params: { operator: username, nr: 5 },
                    timeout: 30000,
                });
                postLinks = r.data.links || [];
            } catch (err: any) {
                console.error(`[Cron] Links error @${username}:`, err.message);
                continue;
            }

            for (let rawLink of postLinks) {
                let link = normalizeInstagramUrl(rawLink);
                if (await SmmPost.exists({ link })) {
                    console.log("[Cron] skip duplicate", link);
                    continue;
                }

                console.log("[Cron] New post:", link);
                let details: any;
                try {
                    const r = await axios.get(`${MICROSERVICE_URL}/get_insta_post`, {
                        params: { url: link, top_comments_count: 3 },
                        timeout: 60000,
                    });
                    details = r.data;
                } catch (err: any) {
                    if (err.response?.status === 404 && link.includes("/reel/")) {
                        const alt = convertReelToP(link);
                        console.log("[Cron] retry as /p/:", alt);
                        try {
                            const r2 = await axios.get(`${MICROSERVICE_URL}/get_insta_post`, {
                                params: { url: alt, top_comments_count: 3 },
                                timeout: 60000,
                            });
                            details = r2.data;
                            link = alt;
                        } catch (err2: any) {
                            console.error("[Cron] still 404:", alt, err2.message);
                            continue;
                        }
                    } else {
                        console.error("[Cron] details fetch failed:", link, err.message);
                        continue;
                    }
                }

                // download each image
                const images: string[] = [];
                if (Array.isArray(details.media)) {
                    for (const m of details.media) {
                        const url = m.image_url || m.thumbnail || m.video_url;
                        if (!url) continue;
                        const local = await downloadMedia(url);
                        if (local) images.push(local);
                    }
                }

                // build doc
                const doc: any = {
                    account: acct.account_name,
                    link,
                    platform: "Instagram",
                    likes: details.likes ?? null,
                    shares: details.views ?? null,
                    comments: details.comments_count ?? null,
                    date: details.date ?? null,
                    hour: details.time ?? null,
                    description: details.description ?? null,
                    sponsored: false,
                    tags: [],
                    category: null,
                    sub_category: null,
                    images,
                    topcomments: Array.isArray(details.top_comments)
                        ? details.top_comments
                        : [],
                };

                // compute weekday
                if (doc.date && /^\d{2}\.\d{2}\.\d{4}$/.test(doc.date)) {
                    const [d,m,y] = doc.date.split(".");
                    const dt = new Date(+y, +m - 1, +d);
                    doc.day_of_the_week = dt
                        .toLocaleDateString("en-US",{ weekday: "long" })
                        .toLowerCase();
                }

                try {
                    const saved = await new SmmPost(doc).save();
                    console.log("[Cron] saved:", saved._id);
                } catch (err: any) {
                    console.error("[Cron] save failed:", link, err.message);
                }
            }
        }
    }

    console.log(`[Cron] Done @ ${new Date().toISOString()}`);
}

export function startInstagramCron() {
    runInstagramCron();
    setInterval(runInstagramCron, 60 * 60 * 1000); //each 1h
}
