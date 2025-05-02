from flask import Flask, request, jsonify
import instaloader
from instaloader import Post, Profile
import logging
from flask_cors import CORS
import random
import time

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)

ACCOUNTS = [
    {'username': 'testing_mtc', 'password': 'test.'},
    {'username': 'testing_account_secret', 'password': 'MTC12345678'},
]

PROXIES = [
    "http://123.456.78.9:8080",
    "http://98.76.54.32:3128",
]

SESSION = None
CURRENT_ACCOUNT_INDEX = 0


def get_user_agent():
    return random.choice([
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Mobile Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:94.0) Gecko/20100101 Firefox/94.0"
    ])


def login_with_account(index: int):
    logging.info(f"Attempting login with account index {index}")
    bot = instaloader.Instaloader(user_agent=get_user_agent())
    if PROXIES:
        proxy = random.choice(PROXIES)
        bot.context._session.proxies = {"http": proxy, "https": proxy}
        logging.info(f"Using proxy: {proxy}")

    acct = ACCOUNTS[index]
    try:
        bot.login(acct['username'], acct['password'])
        logging.info(f"Successfully logged in with {acct['username']}")
        return bot
    except Exception as e:
        logging.warning(f"Login failed for {acct['username']}: {e}")
        return None


def init_session():
    global SESSION, CURRENT_ACCOUNT_INDEX
    for i in range(len(ACCOUNTS)):
        index = (CURRENT_ACCOUNT_INDEX + i) % len(ACCOUNTS)
        bot = login_with_account(index)
        if bot:
            SESSION = bot
            CURRENT_ACCOUNT_INDEX = index
            return
        time.sleep(5)  # delay between attempts to avoid bot detection
    raise Exception("All accounts failed to login.")


def ensure_session():
    global SESSION
    if SESSION is None:
        init_session()
    return SESSION


@app.route('/get_profile', methods=['GET'])
def get_profile():
    username = request.args.get('username')
    if not username:
        return jsonify({'error': 'Username parameter is required'}), 400

    try:
        bot = ensure_session()
        profile = Profile.from_username(bot.context, username)
        return jsonify({
            "username": profile.username,
            "userid": profile.userid,
            "posts": profile.mediacount,
            "followers": profile.followers,
            "following": profile.followees,
            "bio": profile.biography,
            "external_url": profile.external_url,
            "profile_pic": profile.profile_pic_url,
            "is_private": profile.is_private,
            "is_verified": profile.is_verified,
        })
    except instaloader.exceptions.ProfileNotExistsException:
        return jsonify({'error': 'Profile does not exist'}), 404
    except Exception as e:
        logging.error(f"Error in /get_profile: {e}")
        SESSION = None  # force relogin next time
        return jsonify({'error': str(e)}), 500


@app.route('/get_insta_post', methods=['GET'])
def get_insta_post():
    post_url = request.args.get('url')
    top_n = request.args.get('top_comments_count', default=3, type=int)
    if not post_url:
        return jsonify({'error': 'URL parameter is required'}), 400

    try:
        bot = ensure_session()
        shortcode = post_url.rstrip('/').split('/')[-1]
        post = Post.from_shortcode(bot.context, shortcode)

        media = []
        if post.typename == 'GraphSidecar':
            for node in post.get_sidecar_nodes():
                if node.is_video:
                    media.append({"type": "video", "video_url": node.video_url, "thumbnail": node.display_url})
                else:
                    media.append({"type": "image", "image_url": node.display_url})
        else:
            media.append({
                "type": "video" if post.is_video else "image",
                "video_url": post.video_url if post.is_video else None,
                "image_url": None if post.is_video else post.url,
                "thumbnail": post.url if post.is_video else None
            })

        comments = []
        for i, c in enumerate(post.get_comments()):
            if i >= top_n:
                break
            comments.append({
                "owner": c.owner.username if c.owner else None,
                "text": c.text,
                "created_at": c.created_at_utc.isoformat() if c.created_at_utc else None
            })

        return jsonify({
            "likes": post.likes,
            "comments_count": post.comments,
            "views": post.video_view_count if post.is_video else None,
            "media": media,
            "date": post.date_utc.strftime('%d.%m.%Y'),
            "time": post.date_utc.strftime('%H:%M:%S'),
            "datetime": post.date_utc.isoformat(),
            "description": post.caption or "",
            "post_type": post.typename,
            "owner": {
                "username": post.owner_username,
                "id": post.owner_id
            },
            "top_comments": comments
        })

    except instaloader.exceptions.ProfileNotExistsException:
        return jsonify({'error': 'Post or profile does not exist'}), 404
    except Exception as e:
        logging.error(f"Error in /get_insta_post: {e}")
        SESSION = None
        return jsonify({'error': str(e)}), 500


@app.route('/get_insta_post_links', methods=['GET'])
def get_insta_post_links():
    nr = request.args.get('nr', default=5, type=int)
    username = request.args.get('operator')
    if not username:
        return jsonify({'error': 'Operator parameter is required'}), 400

    try:
        bot = ensure_session()
        profile = Profile.from_username(bot.context, username)
        links = []
        for i, post in enumerate(profile.get_posts()):
            if i >= nr:
                break
            if post.is_video:
                links.append(f"https://www.instagram.com/reel/{post.shortcode}/")
            else:
                links.append(f"https://www.instagram.com/p/{post.shortcode}/")
        if not links:
            raise Exception('No posts found')
        return jsonify({"links": links})
    except instaloader.exceptions.ProfileNotExistsException:
        return jsonify({'error': 'Profile does not exist'}), 404
    except Exception as e:
        logging.error(f"Error in /get_insta_post_links: {e}")
        SESSION = None
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    try:
        init_session()
    except Exception as e:
        logging.error(f"Startup login failed: {e}")
    app.run(debug=True, port=5000)
