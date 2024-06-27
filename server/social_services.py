from flask import Flask, request, jsonify, send_file,make_response
import requests
from io import BytesIO
import instaloader
from instaloader import Post
import logging
import json
import os
from flask_cors import CORS

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
            data = json.load(file)
        return data
    else:
        return {}

def write_json(file_name, data):
    file_path = get_json_file_path(file_name)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=4)

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

@app.route('/get_post', methods=['GET'])
def get_post():
    post_url = request.args.get('url')
    if not post_url:
        logging.error('URL parameter is required')
        return jsonify({'error': 'URL parameter is required'}), 400

    try:
        shortcode = post_url.split('/')[-2]
        post = Post.from_shortcode(bot.context, shortcode)

        post_data = {
            "Likes": post.likes,
            "Comments": post.comments,
            "Shares": post.video_view_count if post.is_video else None,
            "Cover_Image_URL": post.url,
            "Date": post.date_utc.strftime('%d.%m.%Y')
        }
        logging.info(f'Successfully retrieved post data for URL: {post_url}')
        return jsonify(post_data)

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

if __name__ == '__main__':
    app.run(debug=True)
