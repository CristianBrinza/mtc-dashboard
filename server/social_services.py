from flask import Flask, request, jsonify
import instaloader
from instaloader import Post, Profile
import logging
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app, resources={r"/json/*": {"origins": "*"}})

logging.basicConfig(level=logging.DEBUG)

# List of Instagram accounts to use for login.
ACCOUNTS = [
    {'username': 'testing_mtc', 'password': 'UltimatePassword1672002.'},
    {'username': 'testing_account_secret', 'password': 'MTC12345678'},
]
current_account_index = 0

# A pool of public proxies (replace with real, reliable proxies in production)
PROXIES = [
    "http://123.456.78.9:8080",
    "http://98.76.54.32:3128",
    # Add more proxies as needed.
]

def get_instaloader_instance():
    """
    Return a logged-in Instaloader instance using one of the available accounts.
    Also, randomly assigns a proxy from the PROXIES list to help avoid IP bans.
    """
    global current_account_index
    bot = instaloader.Instaloader(
        user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) "
                   "AppleWebKit/537.36 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/537.36"
    )

    # Assign a random proxy if available.
    if PROXIES:
        proxy = random.choice(PROXIES)
        bot.context._session.proxies = {"http": proxy, "https": proxy}
        logging.info(f'Using proxy: {proxy}')

    # Try each account until one logs in successfully.
    for _ in range(len(ACCOUNTS)):
        account = ACCOUNTS[current_account_index]
        try:
            bot.login(account['username'], account['password'])
            logging.info(f'Logged into Instagram successfully with {account["username"]}')
            return bot
        except Exception as e:
            logging.error(f'Error logging into Instagram with {account["username"]}: {e}')
            current_account_index = (current_account_index + 1) % len(ACCOUNTS)
    raise Exception("All accounts failed to log in")

def execute_with_alternative_accounts(operation):
    """
    Attempt the given operation (a function that receives a bot instance) using each account.
    If one account fails (e.g. due to rate limits or IP bans), it will try the next.
    """
    last_exception = None
    attempts = len(ACCOUNTS)
    for attempt in range(attempts):
        try:
            bot = get_instaloader_instance()
            return operation(bot)
        except instaloader.exceptions.ProfileNotExistsException as e:
            # If the profile doesn't exist, no point in retrying.
            raise e
        except Exception as e:
            logging.error(f'Operation failed on attempt {attempt + 1}/{attempts}: {e}')
            last_exception = e
    raise last_exception

@app.route('/get_profile', methods=['GET'])
def get_profile():
    insta_username = request.args.get('username')
    if not insta_username:
        logging.error('Username parameter is required')
        return jsonify({'error': 'Username parameter is required'}), 400

    try:
        def operation(bot):
            profile = Profile.from_username(bot.context, insta_username)
            profile_data = {
                "Username": profile.username,
                "User ID": profile.userid,
                "Number of Posts": profile.mediacount,
                "Followers Count": profile.followers,
                "Following Count": profile.followees,
                "Bio": profile.biography,
                "External URL": profile.external_url,
                "Profile Picture": profile.profile_pic_url,
                "Is Private": profile.is_private,
                "Is Verified": profile.is_verified,
            }
            logging.info(f'Successfully retrieved profile data for {insta_username}')
            return profile_data

        result = execute_with_alternative_accounts(operation)
        return jsonify(result)

    except instaloader.exceptions.ProfileNotExistsException:
        logging.error('Profile does not exist')
        return jsonify({'error': 'Profile does not exist'}), 404
    except Exception as e:
        logging.error(f'Error retrieving profile data: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/get_insta_post', methods=['GET'])
def get_insta_post():
    post_url = request.args.get('url')
    img_index = request.args.get('img_index', default=1, type=int)

    if not post_url:
        logging.error('URL parameter is required')
        return jsonify({'error': 'URL parameter is required'}), 400

    try:
        def operation(bot):
            # Extract shortcode from the URL.
            # Assumes URL format: .../p/<shortcode>/, handles trailing slash.
            parts = post_url.rstrip('/').split('/')
            shortcode = parts[-1] if parts[-1] else parts[-2]
            logging.debug(f'Extracted shortcode: {shortcode}')

            post = Post.from_shortcode(bot.context, shortcode)
            logging.debug(f'Retrieved post object: {post}')

            # Handle carousel (sidecar) posts.
            if post.typename == 'GraphSidecar':
                nodes = list(post.get_sidecar_nodes())  # Convert generator to list.
                logging.debug(f'Found {len(nodes)} sidecar nodes')
                if img_index <= len(nodes):
                    node = nodes[img_index - 1]  # 1-based index.
                    image_url = node.display_url
                else:
                    logging.error(f'Image index {img_index} out of range for post')
                    raise Exception('Image index out of range')
            else:
                image_url = post.url

            # Build detailed post data.
            post_data = {
                "Likes": post.likes,
                "Comments": post.comments,
                "Shares": post.video_view_count if post.is_video else None,
                "Cover_Image_URL": image_url,
                "Date": post.date_utc.strftime('%d.%m.%Y'),
                "Time": post.date_utc.strftime('%H:%M:%S'),
                "Datetime": post.date_utc.isoformat(),
                "Caption": post.caption or "",
                "Post Type": post.typename,
                "Video URL": post.video_url if post.is_video else None,
            }
            logging.info(f'Successfully retrieved post data for URL: {post_url}')
            return post_data

        result = execute_with_alternative_accounts(operation)
        return jsonify(result)

    except instaloader.exceptions.ProfileNotExistsException as e:
        logging.error(f'Profile does not exist: {e}')
        return jsonify({'error': 'Profile does not exist'}), 404
    except instaloader.exceptions.InstaloaderException as e:
        logging.error(f'Error loading post: {e}')
        return jsonify({'error': 'Error loading post'}), 500
    except Exception as e:
        logging.error(f'Error retrieving post data: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/get_insta_post_links', methods=['GET'])
def get_insta_post_links():
    nr = request.args.get('nr', default=5, type=int)
    operator = request.args.get('operator')

    if not operator:
        logging.error('Operator parameter is required')
        return jsonify({'error': 'Operator parameter is required'}), 400

    try:
        def operation(bot):
            profile = Profile.from_username(bot.context, operator)
            posts = list(profile.get_posts())  # Convert generator to list.
            if not posts:
                logging.warning(f'No posts found for {operator}')
                raise Exception('No posts found')
            nr_posts = min(nr, len(posts))  # Do not exceed available posts.
            links = [f"https://www.instagram.com/p/{post.shortcode}/" for post in posts[:nr_posts]]
            logging.info(f'Successfully retrieved {nr_posts} post links for {operator}')
            return {'links': links}

        result = execute_with_alternative_accounts(operation)
        return jsonify(result)

    except instaloader.exceptions.ProfileNotExistsException:
        logging.error(f'Profile {operator} does not exist')
        return jsonify({'error': 'Profile does not exist'}), 404
    except Exception as e:
        logging.error(f'Error retrieving post links: {e}')
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5030)
