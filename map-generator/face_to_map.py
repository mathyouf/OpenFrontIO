#!/usr/bin/env python3
"""
Convert a face photo into an OpenFront map!

Usage:
    python face_to_map.py input_photo.jpg map_name

Example:
    python face_to_map.py girlfriend.jpg girlfriendland

This will create:
    assets/maps/girlfriendland/image.png
    assets/maps/girlfriendland/info.json

Then run: go run . --maps=girlfriendland
"""

import sys
import os
import json

try:
    from PIL import Image, ImageFilter, ImageOps, ImageEnhance
except ImportError:
    print("PIL not found. Install with: pip install Pillow")
    sys.exit(1)


def face_to_terrain(input_path: str, map_name: str, invert: bool = True):
    """
    Convert a face photo to terrain map.

    Args:
        input_path: Path to the input image (jpg, png, etc.)
        map_name: Name for the map (lowercase, no spaces)
        invert: If True, dark areas become mountains (recommended for faces)
    """

    # Load and convert to grayscale
    print(f"Loading {input_path}...")
    img = Image.open(input_path).convert('L')

    # Resize to reasonable map dimensions
    target_width = 1600
    aspect = img.height / img.width
    target_height = int(target_width * aspect)

    # Ensure dimensions are multiples of 4
    target_width = target_width - (target_width % 4)
    target_height = target_height - (target_height % 4)

    img = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
    print(f"Resized to {target_width}x{target_height}")

    # Enhance contrast for better terrain definition
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.5)

    # Invert if requested (makes dark features into mountains)
    if invert:
        img = ImageOps.invert(img)
        print("Inverted image (dark→mountains, light→valleys)")

    # Apply slight blur to smooth terrain
    img = img.filter(ImageFilter.GaussianBlur(radius=1))

    # Map grayscale values to terrain range (140-200 for land)
    # Values below 100 become water
    print("Converting to terrain values...")
    pixels = img.load()

    # Create RGB image for output
    output = Image.new('RGB', (target_width, target_height))
    out_pixels = output.load()

    water_threshold = 80  # Below this becomes water

    for x in range(target_width):
        for y in range(target_height):
            gray = pixels[x, y]

            if gray < water_threshold:
                # Water - use the magic water color
                out_pixels[x, y] = (106, 106, 106)
            else:
                # Land - map remaining range to 140-200
                # gray is now 80-255, map to 140-200
                terrain_value = int(140 + (gray - water_threshold) * 60 / (255 - water_threshold))
                terrain_value = max(140, min(200, terrain_value))
                out_pixels[x, y] = (terrain_value, terrain_value, terrain_value)

    # Create water border around the edges
    print("Adding ocean border...")
    border_width = 30
    for x in range(target_width):
        for y in range(target_height):
            # Distance from edge
            dist_from_edge = min(x, y, target_width - x - 1, target_height - y - 1)
            if dist_from_edge < border_width:
                # Fade to water near edges
                fade = dist_from_edge / border_width
                if fade < 0.5:
                    out_pixels[x, y] = (106, 106, 106)  # Water

    # Create output directory
    output_dir = f"assets/maps/{map_name}"
    os.makedirs(output_dir, exist_ok=True)

    # Save the image
    output_path = f"{output_dir}/image.png"
    output.save(output_path)
    print(f"Saved terrain image to {output_path}")

    # Create info.json with spawn points around the face
    # Place nations at strategic points
    info = {
        "name": map_name.title().replace('_', ''),
        "nations": [
            {"coordinates": [target_width//4, target_height//4], "name": "Northern Territory", "flag": "lesswrong"},
            {"coordinates": [3*target_width//4, target_height//4], "name": "Eastern Collective", "flag": "miri"},
            {"coordinates": [target_width//2, target_height//2], "name": "Central Domain", "flag": "anthropic"},
            {"coordinates": [target_width//4, 3*target_height//4], "name": "Western Alliance", "flag": "openai"},
            {"coordinates": [3*target_width//4, 3*target_height//4], "name": "Southern Federation", "flag": "deepmind"},
            {"coordinates": [target_width//2, target_height//4], "name": "Upper Council", "flag": "acx"},
            {"coordinates": [target_width//2, 3*target_height//4], "name": "Lower Assembly", "flag": "ea"},
        ]
    }

    info_path = f"{output_dir}/info.json"
    with open(info_path, 'w') as f:
        json.dump(info, f, indent=2)
    print(f"Saved map info to {info_path}")

    print(f"\n✅ Map '{map_name}' created!")
    print(f"\nNext steps:")
    print(f"1. Add '{map_name}' to map-generator/main.go maps list")
    print(f"2. Run: go run . --maps={map_name}")
    print(f"3. Register in Game.ts, DefaultConfig.ts, Maps.ts")
    print(f"4. Test locally: npm run dev")


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    input_path = sys.argv[1]
    map_name = sys.argv[2].lower().replace(' ', '_').replace('-', '_')

    if not os.path.exists(input_path):
        print(f"Error: File not found: {input_path}")
        sys.exit(1)

    # Ask about inversion
    invert = True
    if len(sys.argv) > 3 and sys.argv[3] == '--no-invert':
        invert = False

    face_to_terrain(input_path, map_name, invert)


if __name__ == "__main__":
    main()
