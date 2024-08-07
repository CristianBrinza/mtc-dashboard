#social_services.py
from flask import Flask, request, jsonify, send_file, make_response
import requests
from io import BytesIO
import instaloader
from instaloader import Post
from instaloader import Profile
import logging
import json
import os
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/json/*": {"origins": "*"}})

logging.basicConfig(level=logging.DEBUG)

USERNAME = 'lorsmif68'
PASSWORD = 'Cb132435'
bot = instaloader.Instaloader()

try:
    bot.login(USERNAME, PASSWORD)
    logging.info('Logged into Instagram successfully')
except Exception as e:
    logging.error(f'Error logging into Instagram: {e}')

def get_json_file_path(file_name):
    return os.path.join('data', 'json', file_name + '.json')

def read_json(file_name):
    file_path = get_json_file_path(file_name)
    if os.path.exists(file_path):
        with open(file_path, 'r') as file:
            try:
                data = json.load(file)
                return data
            except json.JSONDecodeError as e:
                logging.error(f'Error decoding JSON file {file_name}: {e}')
                raise
    else:
        logging.error(f'{file_name}.json does not exist')
        raise FileNotFoundError(f'{file_name}.json does not exist')

def write_json(file_name, data):
    file_path = get_json_file_path(file_name)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=4)

def update_follower_counts():
    try:
        usernames = ["moldtelecom.md", "orangemoldova"]
        today = datetime.utcnow().strftime('%d.%m.%Y')
        statistics = read_json('statistics')

        if "instagram" not in statistics:
            statistics["instagram"] = {}

        for username in usernames:
            profile = Profile.from_username(bot.context, username)
            follower_count = profile.followers
            user_data = statistics["instagram"].get(username, [])

            # Check if today's data exists
            today_data = next((entry for entry in user_data if entry['date'] == today), None)

            if today_data:
                if today_data['followers'] != follower_count:
                    today_data['followers'] = follower_count
            else:
                user_data.append({"date": today, "followers": follower_count})

            statistics["instagram"][username] = user_data

        write_json('statistics', statistics)
        logging.info('Successfully updated follower counts')
    except Exception as e:
        logging.error(f'Error updating follower counts: {e}')

# Schedule the job to run every day at 23:59 UTC
scheduler = BackgroundScheduler()
scheduler.add_job(update_follower_counts, 'cron', hour=23, minute=59)
scheduler.start()

@app.route('/get_profile', methods=['GET'])
def get_profile():
    insta_username = request.args.get('username')
    if not insta_username:
        logging.error('Username parameter is required')
        return jsonify({'error': 'Username parameter is required'}), 400

    try:
        profile = instaloader.Profile.from_username(bot.context, insta_username)

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
        # Extract shortcode from the URL
        shortcode = post_url.split('/')[-2]
        logging.debug(f'Extracted shortcode: {shortcode}')

        post = Post.from_shortcode(bot.context, shortcode)
        logging.debug(f'Retrieved post object: {post}')

        # Handle carousel images
        if post.typename == 'GraphSidecar':
            nodes = list(post.get_sidecar_nodes())  # Convert generator to list
            logging.debug(f'Found {len(nodes)} sidecar nodes')
            if img_index <= len(nodes):
                node = nodes[img_index - 1]  # Convert img_index to 0-based index
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
        return jsonify({'error': 'Profile not exists'}), 404
    except instaloader.exceptions.InstaloaderException as e:
        logging.error(f'Error loading post: {e}')
        return jsonify({'error': 'Error loading post'}), 500
    except Exception as e:
        logging.error(f'Error retrieving post data: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/json/<file_name>', methods=['GET'])
def get_json(file_name):
    try:
        data = read_json(file_name)
        logging.info(f'Successfully retrieved JSON data from {file_name}')
        return jsonify(data)
    except Exception as e:
        logging.error(f'Error retrieving JSON data from {file_name}: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/json/<file_name>', methods=['POST'])
def post_json(file_name):
    try:
        new_data = request.get_json()
        if not new_data:
            logging.error('No data provided')
            return jsonify({'error': 'No data provided'}), 400

        logging.info(f'Received data for {file_name}: {new_data}')
        data = read_json(file_name)

        if not isinstance(data, list):
            data = []

        data.append(new_data)  # Append the new entry to the array
        logging.debug(f'Updated data: {data}')

        write_json(file_name, data)
        logging.info(f'Successfully updated JSON data in {file_name}')

        return jsonify({'message': 'Data updated successfully'})
    except Exception as e:
        logging.error(f'Error updating JSON data in {file_name}: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/json/<file_name>', methods=['PUT'])
def put_json(file_name):
    new_data = request.get_json()
    if not new_data:
        logging.error('No data provided')
        return jsonify({'error': 'No data provided'}), 400

    try:
        write_json(file_name, new_data)
        logging.info(f'Successfully replaced JSON data in {file_name}')
        return jsonify({'message': 'Data replaced successfully'})
    except Exception as e:
        logging.error(f'Error replacing JSON data in {file_name}: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/json/<file_name>', methods=['DELETE'])
def delete_json(file_name):
    try:
        file_path = get_json_file_path(file_name)
        if os.path.exists(file_path):
            os.remove(file_path)
            logging.info(f'Successfully deleted JSON file {file_name}')
            return jsonify({'message': f'{file_name} deleted successfully'})
        else:
            logging.error(f'File {file_name} does not exist')
            return jsonify({'error': 'File does not exist'}), 404
    except Exception as e:
        logging.error(f'Error deleting JSON file {file_name}: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/json/smm', methods=['DELETE'])
def delete_smm_item():
    try:
        item_id = request.json.get('id')
        if not item_id:
            return jsonify({'error': 'Item ID is required'}), 400

        data = read_json('smm')
        data = [item for item in data if item['id'] != item_id]
        write_json('smm', data)
        return jsonify({'message': 'Item deleted successfully'})
    except Exception as e:
        logging.error(f'Error deleting item: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/proxy_image')
def proxy_image():
    url = request.args.get('url')
    response = requests.get(url)
    response_obj = make_response(send_file(BytesIO(response.content), mimetype='image/jpeg'))
    response_obj.headers['Cache-Control'] = 'public, max-age=31536000'  # Cache for 1 year
    return response_obj

@app.route('/get_insta_post_links', methods=['GET'])
def get_insta_post_links():
    nr = request.args.get('nr', default=5, type=int)
    operator = request.args.get('operator')

    if not operator:
        logging.error('Operator parameter is required')
        return jsonify({'error': 'Operator parameter is required'}), 400

    try:
        profile = Profile.from_username(bot.context, operator.split('/')[-2])
        posts = profile.get_posts()

        links = []
        count = 0

        for post in posts:
            if count >= nr:
                break
            links.append(f"https://www.instagram.com/p/{post.shortcode}/")
            count += 1

        logging.info(f'Successfully retrieved {nr} post links for {operator}')
        return jsonify(links)

    except Exception as e:
        logging.error(f'Error retrieving post links: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/json/statistics', methods=['GET'])
def get_statistics_json():
    try:
        data = read_json('statistics')
        logging.info('Successfully retrieved statistics JSON data')
        return jsonify(data)
    except FileNotFoundError:
        logging.error('Statistics JSON file not found')
        return jsonify({'error': 'Statistics JSON file not found'}), 404
    except json.JSONDecodeError:
        logging.error('Error decoding JSON file')
        return jsonify({'error': 'Error decoding JSON file'}), 500
    except Exception as e:
        logging.error(f'Unexpected error retrieving statistics JSON data: {e}')
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
