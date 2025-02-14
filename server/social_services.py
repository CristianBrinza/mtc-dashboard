from flask import Flask, request, jsonify
import instaloader
from instaloader import Post, Profile
import logging
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/json/*": {"origins": "*"}})

logging.basicConfig(level=logging.DEBUG)

ACCOUNTS = [
    {'username': 'testing_mtc', 'password': 'UltimatePassword1672002.'},
    {'username': 'testing_account_secret', 'password': 'MTC12345678'},
]
current_account_index = 0

def get_instaloader_instance():
    """Return a logged-in Instaloader instance using one of the available accounts."""
    global current_account_index
    bot = instaloader.Instaloader(
        user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) "
                   "AppleWebKit/537.36 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/537.36"
    )

    # Try each account until one logs in successfully
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

@app.route('/get_profile', methods=['GET'])
def get_profile():
    insta_username = request.args.get('username')
    if not insta_username:
        logging.error('Username parameter is required')
        return jsonify({'error': 'Username parameter is required'}), 400

    try:
        bot = get_instaloader_instance()
        profile = Profile.from_username(bot.context, insta_username)

        profile_data = {
            "Username": profile.username,
            "User ID": profile.userid,
            "Number of Posts": profile.mediacount,
            "Followers Count": profile.followers,
            "Following Count": profile.followees,
            "Bio": profile.biography,
            "External URL": profile.external_url
        }
        logging.info(f'Successfully retrieved profile data for {insta_username}')
        return jsonify(profile_data)

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
        bot = get_instaloader_instance()
        # Extract shortcode from the URL (assumes URL format ends with /p/<shortcode>/)
        shortcode = post_url.rstrip('/').split('/')[-1] if post_url.endswith('/') else post_url.split('/')[-1]
        if not shortcode:
            shortcode = post_url.split('/')[-2]
        logging.debug(f'Extracted shortcode: {shortcode}')

        post = Post.from_shortcode(bot.context, shortcode)
        logging.debug(f'Retrieved post object: {post}')

        # Handle carousel (sidecar) posts
        if post.typename == 'GraphSidecar':
            nodes = list(post.get_sidecar_nodes())  # Convert generator to list
            logging.debug(f'Found {len(nodes)} sidecar nodes')
            if img_index <= len(nodes):
                node = nodes[img_index - 1]  # img_index is 1-based
                image_url = node.display_url
            else:
                logging.error(f'Image index {img_index} out of range for post')
                return jsonify({'error': 'Image index out of range'}), 400
        else:
            image_url = post.url

        post_data = {
            "Likes": post.likes,
            "Comments": post.comments,
            "Shares": post.video_view_count if post.is_video else None,
            "Cover_Image_URL": image_url,
            "Date": post.date_utc.strftime('%d.%m.%Y')
        }
        logging.info(f'Successfully retrieved post data for URL: {post_url}')
        return jsonify(post_data)

    except instaloader.exceptions.ProfileNotExistsException as e:
        logging.error(f'Profile not exists: {e}')
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
        bot = get_instaloader_instance()
        profile = Profile.from_username(bot.context, operator)
        posts = list(profile.get_posts())  # Convert generator to list

        if not posts:
            logging.warning(f'No posts found for {operator}')
            return jsonify({'error': 'No posts found'}), 404

        nr = min(nr, len(posts))  # Do not exceed available posts
        links = [f"https://www.instagram.com/p/{post.shortcode}/" for post in posts[:nr]]

        logging.info(f'Successfully retrieved {nr} post links for {operator}')
        return jsonify({'links': links})

    except instaloader.exceptions.ProfileNotExistsException:
        logging.error(f'Profile {operator} does not exist')
        return jsonify({'error': 'Profile does not exist'}), 404
    except Exception as e:
        logging.error(f'Error retrieving post links: {e}')
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
