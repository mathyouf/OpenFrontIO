#!/usr/bin/env python3
"""
Generate a sample map image for OpenFront.
Creates a fantasy continent with islands.

Usage: python generate_sample_map.py
Output: assets/maps/rationalistrealm/image.png
"""

import random
import math

# Try to use PIL, fall back to pure Python PNG writer if not available
try:
    from PIL import Image, ImageDraw, ImageFilter
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    print("PIL not found. Install with: pip install Pillow")
    print("Or create image.png manually in an image editor.")
    exit(1)

def generate_map(width=1600, height=1200, seed=42):
    """Generate a fantasy map with continents and islands."""
    random.seed(seed)

    # Create image with water (blue = 106 is water key color)
    img = Image.new('RGB', (width, height), (106, 106, 106))
    draw = ImageDraw.Draw(img)

    def draw_landmass(cx, cy, size, irregularity=0.3):
        """Draw an irregular landmass centered at (cx, cy)."""
        points = []
        num_points = 24
        for i in range(num_points):
            angle = (2 * math.pi * i) / num_points
            # Add randomness to radius
            r = size * (1 + random.uniform(-irregularity, irregularity))
            x = cx + r * math.cos(angle)
            y = cy + r * math.sin(angle)
            points.append((x, y))

        # Draw with varying terrain (blue channel determines height)
        # Plains: 140-158, Highland: 159-178, Mountain: 179-200
        draw.polygon(points, fill=(150, 150, 150))  # Base plains

        # Add highlands in center
        highland_points = [(cx + (x-cx)*0.6, cy + (y-cy)*0.6) for x, y in points]
        draw.polygon(highland_points, fill=(170, 170, 170))

        # Add mountain peaks
        mountain_points = [(cx + (x-cx)*0.3, cy + (y-cy)*0.3) for x, y in points]
        draw.polygon(mountain_points, fill=(190, 190, 190))

    # Main continent
    draw_landmass(width*0.5, height*0.5, min(width, height)*0.35, 0.4)

    # Large islands
    draw_landmass(width*0.15, height*0.3, 120, 0.5)
    draw_landmass(width*0.85, height*0.35, 140, 0.45)
    draw_landmass(width*0.2, height*0.75, 100, 0.5)
    draw_landmass(width*0.8, height*0.7, 130, 0.4)

    # Small islands
    for _ in range(8):
        x = random.randint(50, width-50)
        y = random.randint(50, height-50)
        draw_landmass(x, y, random.randint(40, 80), 0.6)

    # Apply blur to smooth edges
    img = img.filter(ImageFilter.GaussianBlur(radius=2))

    # Ensure water stays water (reset very low blue values)
    pixels = img.load()
    for x in range(width):
        for y in range(height):
            r, g, b = pixels[x, y]
            if b < 120:  # If it got blurred too dark, make it water
                pixels[x, y] = (106, 106, 106)

    return img

def main():
    print("Generating sample map...")
    img = generate_map(width=1600, height=1200, seed=42)

    output_path = "assets/maps/rationalistrealm/image.png"
    img.save(output_path)
    print(f"Saved to {output_path}")
    print("\nNext steps:")
    print("1. Edit the image in GIMP/Photoshop if desired")
    print("2. Run the map generator: go run . --maps=rationalistrealm")

if __name__ == "__main__":
    main()
