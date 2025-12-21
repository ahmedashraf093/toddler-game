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
        # Weather/Nature
        'Sunny', 'Snowy', 'Rainy', 'Cold', 'Night', 'Windy', 'Ocean', 'Spring', 'Moon',
        # Habitats
        'Farm', 'Jungle', 'Sea',
        # Jobs / People
        'Police', 'Fireman', 'Doctor', 'Astronaut', 'Chef', 'Farmer', 'Artist', 'Mechanic', 'Teacher', 'Pilot', 'Builder', 'Scientist',
        # Extras from objectPool
        'Suns', 'Shoes', 'Apples', 'Cars', 'Stars', 'Butterflies', 'Ladybugs', 'Cookies', 'Balloons', 'Balls', 'Dogs'
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
            # check if exists (generation might fail)
            if os.path.exists(entry['path']):
                f.write(f"file '{os.path.basename(entry['path'])}'\n")
                valid_entries.append(entry)
            else:
                print(f"WARNING: Skipping missing file {entry['path']}")

    output_mp3 = os.path.join(OUTPUT_DIR, 'sprites.mp3')

    print("Stitching with ffmpeg...")
    subprocess.run([
        'ffmpeg', '-f', 'concat', '-safe', '0',
        '-i', 'files.txt', '-c', 'copy', '-y', f'../{output_mp3}'
    ], cwd=TEMP_DIR)

    # 3. Calculate Offsets
    sprite_map = {}
    current_offset = 0

    for entry in valid_entries:
        # Get duration
        result = subprocess.run([
            'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
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
