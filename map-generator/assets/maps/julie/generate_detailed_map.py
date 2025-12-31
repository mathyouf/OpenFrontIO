#!/usr/bin/env python3
"""
Enhanced portrait-to-map converter that preserves facial detail.
Uses edge detection to create terrain features from facial features.
"""

from PIL import Image, ImageFilter, ImageOps, ImageEnhance
import sys

def detect_edges_simple(img):
    """Simple edge detection using PIL's built-in filters."""
    # Convert to grayscale
    gray = img.convert('L')

    # Apply edge detection
    edges = gray.filter(ImageFilter.FIND_EDGES)

    # Enhance the edges
    edges = ImageOps.autocontrast(edges)

    return edges

def create_detailed_terrain_map(input_path, output_path):
    """
    Create a terrain map that preserves facial detail.

    Strategy:
    1. Detect blue background -> water (transparent/low blue)
    2. Use edge detection to find facial features -> highlands/mountains
    3. Use luminosity for base terrain elevation
    4. Combine edges with base to create detailed terrain
    """

    # Load image
    img = Image.open(input_path)

    # Convert to RGBA if needed
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    width, height = img.size
    print(f"Processing image: {width}x{height}")

    # Get grayscale for base luminosity
    gray = img.convert('L')

    # Detect edges for detail preservation
    edges = detect_edges_simple(img)

    # Enhance contrast in the grayscale
    enhancer = ImageEnhance.Contrast(gray)
    gray_enhanced = enhancer.enhance(1.5)

    # Create output image
    output = Image.new('RGBA', (width, height))

    pixels_in = img.load()
    gray_pixels = gray_enhanced.load()
    edge_pixels = edges.load()
    pixels_out = output.load()

    water_count = 0
    land_count = 0

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels_in[x, y]
            lum = gray_pixels[x, y]
            edge_val = edge_pixels[x, y]

            # Detect blue background (water)
            # Blue background: high blue, relatively low red/green
            is_blue_bg = (b > 140 and b > r + 15 and b > g - 10 and r < 180 and g < 200)

            # Also check for very light blue
            is_light_blue = (b > 180 and r > 140 and g > 160 and b > r and b > g)

            if is_blue_bg or is_light_blue or a < 50:
                # Water - make transparent (or very low blue)
                pixels_out[x, y] = (0, 0, 50, 0)  # Transparent = water
                water_count += 1
            else:
                # Land - combine luminosity with edge detection
                # Edges should be higher elevation (more visible)

                # Base terrain from luminosity (inverted - darker = higher)
                # Map to range 140-200 (plains to mountains)
                base_terrain = 140 + int((255 - lum) * 60 / 255)

                # Edge boost - strong edges become mountains
                if edge_val > 100:
                    edge_boost = int((edge_val - 100) * 40 / 155)
                    terrain_val = min(200, base_terrain + edge_boost)
                else:
                    terrain_val = base_terrain

                # Clamp to valid range
                terrain_val = max(140, min(200, terrain_val))

                # Output as grayscale in blue channel (map generator reads blue)
                pixels_out[x, y] = (terrain_val, terrain_val, terrain_val, 255)
                land_count += 1

    # Save output
    output.save(output_path, 'PNG')

    print(f"Water pixels: {water_count}")
    print(f"Land pixels: {land_count}")
    print(f"Water percentage: {water_count * 100 / (width * height):.1f}%")
    print(f"Saved to: {output_path}")

    return output

def create_high_detail_map(input_path, output_path):
    """
    Alternative approach: Use the original image's detail more directly.

    Strategy:
    1. Keep the crinkly texture as terrain variation
    2. Map darker areas (hair, eyes, shadows) to higher elevations
    3. Map lighter areas (skin highlights) to lower elevations
    4. Blue background becomes water
    """

    img = Image.open(input_path)

    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    width, height = img.size
    print(f"High-detail processing: {width}x{height}")

    # Enhance local contrast to bring out texture
    gray = img.convert('L')

    # Apply unsharp mask to enhance detail
    detail_enhanced = gray.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=3))

    # Also get edges
    edges = gray.filter(ImageFilter.FIND_EDGES)
    edges = ImageOps.autocontrast(edges)

    output = Image.new('RGBA', (width, height))

    pixels_in = img.load()
    detail_pixels = detail_enhanced.load()
    edge_pixels = edges.load()
    pixels_out = output.load()

    water_count = 0

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels_in[x, y]
            detail = detail_pixels[x, y]
            edge = edge_pixels[x, y]

            # Detect blue background
            is_blue_bg = (b > 140 and b > r + 15 and b > g - 10 and r < 180 and g < 200)
            is_light_blue = (b > 180 and r > 140 and g > 160 and b > r and b > g)

            if is_blue_bg or is_light_blue or a < 50:
                pixels_out[x, y] = (0, 0, 50, 0)
                water_count += 1
            else:
                # Terrain mapping:
                # - Very dark (hair, eyes) -> mountains (190-200)
                # - Dark (shadows) -> highlands (170-190)
                # - Medium (skin) -> plains (150-170)
                # - Light (highlights) -> lowlands (140-150)

                # Invert detail so dark = high elevation
                inv_detail = 255 - detail

                # Map to terrain range 140-200
                terrain = 140 + int(inv_detail * 60 / 255)

                # Add edge enhancement for texture
                if edge > 80:
                    terrain = min(200, terrain + int(edge * 0.1))

                terrain = max(140, min(200, terrain))

                pixels_out[x, y] = (terrain, terrain, terrain, 255)

    output.save(output_path, 'PNG')

    print(f"Water pixels: {water_count}")
    print(f"Total: {width * height}")
    print(f"Saved to: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        # Default: process julie2.png
        input_file = "julie2.png"
    else:
        input_file = sys.argv[1]

    output_file = "image.png"

    print("=== Creating high-detail terrain map ===")
    create_high_detail_map(input_file, output_file)
