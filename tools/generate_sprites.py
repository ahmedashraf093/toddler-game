import os
import asyncio
import edge_tts
import random
import sys
import shutil
import subprocess
import json

# Fragments Content
content = {
    'generic': [
        {'id': 'good_job', 'text': 'Good Job!'},
        {'id': 'try_again', 'text': 'Try Again!'},
        {'id': 'match', 'text': 'Match!'},
        {'id': 'correct', 'text': 'Correct!'},
        {'id': 'yummy', 'text': 'Yummy!'},
        {'id': 'home', 'text': 'Home!'},
        {'id': 'nature', 'text': 'Nature!'},
        {'id': 'amazing', 'text': 'Amazing!'}
    ],
    'system': [
        {'id': 'find_the_pairs', 'text': 'Find the pairs!'},
        {'id': 'found_all_pairs', 'text': 'You found all the pairs!'},
        {'id': 'memory_master', 'text': 'Memory Master!'},
        {'id': 'need_parent_help', 'text': 'Need parent help!'},
        {'id': 'choose_a_game', 'text': 'Choose a game!'},
        {'id': 'loading', 'text': 'Loading...'},
        {'id': 'daily_quest', 'text': 'Daily Quest'},
        {'id': 'complete_story', 'text': 'Complete the Story!'},
        {'id': 'story_maker', 'text': 'Story Maker'}
    ],
    'connector': [
        {'id': 'the', 'text': 'The'},
        {'id': 'a', 'text': 'A'},
        {'id': 'an', 'text': 'An'},
        {'id': 'eats_the', 'text': 'eats the'},
        {'id': 'lives_in_the', 'text': 'lives in the'},
        {'id': 'looks_like_a', 'text': 'looks like a'},
        {'id': 'looks_like_an', 'text': 'looks like an'},
        {'id': 'uses', 'text': 'uses'},
        {'id': 'wakes_up', 'text': 'wakes up'},
        {'id': 'fall_down', 'text': 'fall down'},
        {'id': 'swim_in_water', 'text': 'swim in water'},
        {'id': 'love_flowers', 'text': 'love flowers'},
        {'id': 'becomes_a', 'text': 'becomes a'},
        {'id': 'wear_your', 'text': 'Wear your'},
        {'id': 'wear_a', 'text': 'Wear a'},
        {'id': 'wear', 'text': 'Wear'},
        {'id': 'use_an', 'text': 'Use an'}
    ],
    'alphabet': [
        {'id': 'a', 'text': 'A'}, {'id': 'b', 'text': 'B'}, {'id': 'c', 'text': 'C'},
        {'id': 'd', 'text': 'D'}, {'id': 'e', 'text': 'E'}, {'id': 'f', 'text': 'F'},
        {'id': 'g', 'text': 'G'}, {'id': 'h', 'text': 'H'}, {'id': 'i', 'text': 'I'},
        {'id': 'j', 'text': 'J'}, {'id': 'k', 'text': 'K'}, {'id': 'l', 'text': 'L'},
        {'id': 'm', 'text': 'M'}, {'id': 'n', 'text': 'N'}, {'id': 'o', 'text': 'O'},
        {'id': 'p', 'text': 'P'}, {'id': 'q', 'text': 'Q'}, {'id': 'r', 'text': 'R'},
        {'id': 's', 'text': 'S'}, {'id': 't', 'text': 'T'}, {'id': 'u', 'text': 'U'},
        {'id': 'v', 'text': 'V'}, {'id': 'w', 'text': 'W'}, {'id': 'x', 'text': 'X'},
        {'id': 'y', 'text': 'Y'}, {'id': 'z', 'text': 'Z'}
    ],
    'noun': [
        # Animals
        'Lion', 'Tiger', 'Zebra', 'Giraffe', 'Monkey', 'Gorilla', 'Wolf', 'Buffalo', 'Deer',
        'Cow', 'Rooster', 'Chicken', 'Dog', 'Cat', 'Mouse', 'Rabbit', 'Frog', 'Squirrel',
        'Octopus', 'Whale', 'Fish', 'Turtle', 'Owl', 'Bee', 'Caterpillar', 'Butterfly', 'Penguin',
        # Foods
        'Carrot', 'Banana', 'Bone', 'Cheese', 'Meat', 'Fly', 'Nut', 'Apple', 'Grapes',
        'Ice Cream', 'Juice', 'Orange', 'Pizza', 'Water', 'Avocado', 'Strawberry', 'Cookie',
        # Objects/Tools
        'Police Car', 'Fire Truck', 'Ambulance', 'Rocket', 'Pan', 'Tractor', 'Paint',
        'Wrench', 'Books', 'Airplane', 'Hammer', 'Microscope',
        'Ball', 'House', 'Kite', 'Nose', 'Queen', 'Sun', 'Tree', 'Umbrella', 'Violin',
        'Xylophone', 'Yellow', 'Clock', 'Gift', 'Door', 'Sunglasses', 'Scarf', 'Gloves',
        'Leaf', 'Flower', 'Bus', 'Train', 'Helicopter', 'Crayon', 'Teddy Bear', 'Balloon',
        # Shapes
        'Triangle', 'Circle', 'Square', 'Rectangle', 'Oval', 'Diamond', 'Pizza Slice',
        'Sunny', 'Snowy', 'Rainy', 'Cold', 'Night', 'Windy', 'Ocean', 'Spring',
        'Farm', 'Jungle', 'Sea',
        # New additions
        'Shoe', 'Star', 'Ladybug', 'Cookie', 'Balloon', 'Crayon', 'Teddy Bear', 'Strawberry',
        'Car', 'Bus', 'Train', 'Helicopter',
        'Police', 'Fireman', 'Doctor', 'Astronaut', 'Chef', 'Farmer', 'Artist',
        'Mechanic', 'Teacher', 'Pilot', 'Builder', 'Scientist',
        # New additions for Story Maker (Round 2)
        'Bear', 'Honey', 'Bird', 'Nest', 'Spider', 'Web', 'Whistle', 'Brush',
        'Dentist', 'Toothbrush', 'Gardener', 'Baby', 'Milk'
    ]
}

TEMP_DIR = "temp_speech"
OUTPUT_DIR = "assets/audio"
VOICE = "en-US-AnaNeural"
MAX_CONCURRENT = 3 # Reduced concurrency to prevent timeouts
semaphore = asyncio.Semaphore(MAX_CONCURRENT)
RETRIES = 3

async def generate_audio(text, filepath):
    if os.path.exists(filepath):
        return

    async with semaphore:
        for attempt in range(RETRIES):
            try:
                communicate = edge_tts.Communicate(text, VOICE)
                await communicate.save(filepath)
                return # Success
            except Exception as e:
                print(f"Error generating {filepath} (Attempt {attempt+1}/{RETRIES}): {e}")
                await asyncio.sleep(2 * (attempt + 1)) # Backoff

        print(f"FAILED to generate {filepath} after {RETRIES} attempts.")

async def main():
    if not os.path.exists(TEMP_DIR):
        os.makedirs(TEMP_DIR)

    # 1. Generate all files to temp
    tasks = []
    file_map = [] # Ordered list of (id, filepath)

    # Generic
    for item in content['generic']:
        key = f"generic_{item['id']}"
        filepath = os.path.join(TEMP_DIR, f"{key}.mp3")
        tasks.append(generate_audio(item['text'], filepath))
        file_map.append({'key': key, 'path': filepath})

    # System (New)
    for item in content.get('system', []):
        key = f"sys_{item['id']}"
        filepath = os.path.join(TEMP_DIR, f"{key}.mp3")
        tasks.append(generate_audio(item['text'], filepath))
        file_map.append({'key': key, 'path': filepath})

    # Connectors
    for item in content['connector']:
        key = f"conn_{item['id']}"
        filepath = os.path.join(TEMP_DIR, f"{key}.mp3")
        tasks.append(generate_audio(item['text'], filepath))
        file_map.append({'key': key, 'path': filepath})

    # Alphabet
    for item in content['alphabet']:
        key = f"alpha_{item['id']}"
        filepath = os.path.join(TEMP_DIR, f"{key}.mp3")
        tasks.append(generate_audio(item['text'], filepath))
        file_map.append({'key': key, 'path': filepath})

    # Nouns
    for text in content['noun']:
        safe_id = text.lower().replace(' ', '_')
        key = f"noun_{safe_id}"
        filepath = os.path.join(TEMP_DIR, f"{key}.mp3")
        tasks.append(generate_audio(text, filepath))
        file_map.append({'key': key, 'path': filepath})

    print(f"Generating {len(tasks)} temp files...")
    await asyncio.gather(*tasks)

    # 2. Concat using ffmpeg
    list_txt = os.path.join(TEMP_DIR, 'files.txt')
    valid_entries = []
    with open(list_txt, 'w') as f:
        for entry in file_map:
            if os.path.exists(entry['path']):
                f.write(f"file '{os.path.basename(entry['path'])}'\n")
                valid_entries.append(entry)
            else:
                print(f"WARNING: Skipping missing file {entry['path']}")

    output_mp3 = os.path.join(OUTPUT_DIR, 'sprites.mp3')

    # Point to local ffmpeg if available in tools, else assume system path
    ffmpeg_cmd = 'ffmpeg'
    if os.path.exists('tools/ffmpeg'):
        ffmpeg_cmd = '../tools/ffmpeg'

    print("Stitching with ffmpeg...")
    subprocess.run([
        ffmpeg_cmd, '-f', 'concat', '-safe', '0',
        '-i', 'files.txt', '-c', 'copy', '-y', f'../{output_mp3}'
    ], cwd=TEMP_DIR)

    # 3. Calculate Offsets
    # Use ffprobe from same location if possible, or assume system
    # I installed ffmpeg static which usually includes ffprobe.
    # Check if tools/ffprobe exists? I only moved ffmpeg.
    # The static build has ffprobe. I should have moved it too.
    # I'll check if I can use ffmpeg to get duration or just use the python library?
    # Or I should have moved ffprobe.

    # Quick fix: I will assume ffprobe is available or use ffmpeg to detect duration?
    # Actually, I downloaded ffmpeg static but only moved `ffmpeg` binary in my previous bash command.
    # "mv ffmpeg-*-amd64-static/ffmpeg ."
    # I did NOT move ffprobe.
    # I need to fix this or `generate_sprites.py` will fail at step 3.

    # I will verify if I can get ffprobe.
    pass

    # ... Wait, I can't edit the script mid-execution.
    # I will let this script fail or I will fix the environment first.

    # 3. Calculate Offsets (We need duration of each file)
    sprite_map = {}
    current_offset = 0

    ffprobe_cmd = 'ffprobe'
    if os.path.exists('tools/ffprobe'):
        ffprobe_cmd = 'tools/ffprobe'

    for entry in file_map:
        if not os.path.exists(entry['path']):
            continue

        # Get duration
        # If ffprobe is missing, this will crash/fail.
        result = subprocess.run([
            ffprobe_cmd, '-v', 'error', '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1', entry['path']
        ], capture_output=True, text=True)

        try:
            duration = float(result.stdout.strip())
            sprite_map[entry['key']] = {
                'start': current_offset,
                'end': current_offset + duration,
                'duration': duration
            }
            current_offset += duration
        except ValueError:
            print(f"Error reading duration for {entry['path']}")

    # 4. Write JSON
    with open(os.path.join(OUTPUT_DIR, 'sprites.json'), 'w') as f:
        json.dump(sprite_map, f)

    # 5. Cleanup
    shutil.rmtree(TEMP_DIR)
    print("Done! Sprites generated.")

if __name__ == "__main__":
    asyncio.run(main())
