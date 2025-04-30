# app.py (Flask backend)

from flask import Flask, request, jsonify
import instaloader
from instaloader import Post, Profile
import logging
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app, resources={r"/json/*": {"origins": "*"}})

logging.basicConfig(level=logging.DEBUG)

ACCOUNTS = [
    {'username': 'testing_mtc', 'password': 'test.'},
    {'username': 'testing_account_secret', 'password': 'MTC12345678'},
]
current_account_index = 0

PROXIES = [
    "http://123.456.78.9:8080",
    "http://98.76.54.32:3128",
]

def get_instaloader_instance():
    global current_account_index
    bot = instaloader.Instaloader(
        user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) "
                   "AppleWebKit/537.36 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/537.36"
    )
    if PROXIES:
        proxy = random.choice(PROXIES)
        bot.context._session.proxies = {"http": proxy, "https": proxy}
        logging.info(f'Using proxy: {proxy}')

    for _ in range(len(ACCOUNTS)):
        acct = ACCOUNTS[current_account_index]
        try:
            bot.login(acct['username'], acct['password'])
            logging.info(f'Logged in with {acct["username"]}')
            return bot
        except Exception as e:
            logging.error(f'Login failed for {acct["username"]}: {e}')
            current_account_index = (current_account_index + 1) % len(ACCOUNTS)
    raise Exception("All accounts failed to log in")

def execute_with_alternative_accounts(operation):
    last_exc = None
    for attempt in range(len(ACCOUNTS)):
        try:
            bot = get_instaloader_instance()
            return operation(bot)
        except instaloader.exceptions.ProfileNotExistsException:
            raise
        except Exception as e:
            logging.error(f'Attempt {attempt+1} failed: {e}')
            last_exc = e
    raise last_exc

@app.route('/get_profile', methods=['GET'])
def get_profile():
    username = request.args.get('username')
    if not username:
        return jsonify({'error': 'Username parameter is required'}), 400

    try:
        def op(bot):
            profile = Profile.from_username(bot.context, username)
            return {
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
            }
        return jsonify(execute_with_alternative_accounts(op))
    except instaloader.exceptions.ProfileNotExistsException:
        return jsonify({'error': 'Profile does not exist'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_insta_post', methods=['GET'])
def get_insta_post():
    post_url = request.args.get('url')
    top_n = request.args.get('top_comments_count', default=3, type=int)
    if not post_url:
        return jsonify({'error': 'URL parameter is required'}), 400

    try:
        def op(bot):
            shortcode = post_url.rstrip('/').split('/')[-1]
            post = Post.from_shortcode(bot.context, shortcode)

            # Build media list
            media = []
            if post.typename == 'GraphSidecar':
                for node in post.get_sidecar_nodes():
                    if node.is_video:
                        media.append({
                            "type": "video",
                            "video_url": node.video_url,
                            "thumbnail": node.display_url
                        })
                    else:
                        media.append({
                            "type": "image",
                            "image_url": node.display_url
                        })
            else:
                if post.is_video:
                    media.append({
                        "type": "video",
                        "video_url": post.video_url,
                        "thumbnail": post.url
                    })
                else:
                    media.append({
                        "type": "image",
                        "image_url": post.url
                    })

            # Top comments
            comments = []
            for i, c in enumerate(post.get_comments()):
                if i >= top_n: break
                comments.append({
                    "owner": c.owner.username if c.owner else None,
                    "text": c.text,
                    "created_at": c.created_at_utc.isoformat() if c.created_at_utc else None
                })

            return {
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
            }

        return jsonify(execute_with_alternative_accounts(op))
    except instaloader.exceptions.ProfileNotExistsException:
        return jsonify({'error': 'Post or profile does not exist'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_insta_post_links', methods=['GET'])
def get_insta_post_links():
    nr = request.args.get('nr', default=5, type=int)
    usern = request.args.get('operator')
    if not usern:
        return jsonify({'error': 'Operator parameter is required'}), 400

    try:
        def op(bot):
            profile = Profile.from_username(bot.context, usern)
            posts = list(profile.get_posts())
            if not posts:
                raise Exception('No posts found')
            urls = []
            for post in posts[:nr]:
                if post.typename == 'GraphVideo':
                    urls.append(f"https://www.instagram.com/reel/{post.shortcode}/")
                else:
                    urls.append(f"https://www.instagram.com/p/{post.shortcode}/")
            return {"links": urls}

        return jsonify(execute_with_alternative_accounts(op))
    except instaloader.exceptions.ProfileNotExistsException:
        return jsonify({'error': 'Profile does not exist'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
