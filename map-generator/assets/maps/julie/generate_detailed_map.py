#!/usr/bin/env python3
"""
Subtle portrait-to-terrain converter.
Maximizes terrain variation to preserve fine detail from portraits.
"""

from PIL import Image, ImageFilter, ImageOps, ImageEnhance
import sys

def create_subtle_terrain_map(input_path, output_path):
    """
    Create terrain with maximum subtlety and detail preservation.

    The game terrain uses blue channel values:
    - < 140: water
    - 140-158: plains (lowland)
    - 159-178: highlands
    - 179-200: mountains

    To preserve detail, we need to:
    1. Spread values across the FULL 140-200 range
    2. Use local contrast to preserve texture
    3. Apply histogram equalization to maximize dynamic range
    """

    img = Image.open(input_path)

    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    width, height = img.size
    print(f"Processing: {width}x{height}")

    # Step 1: Create grayscale with enhanced local contrast
    gray = img.convert('L')

    # Apply CLAHE-like local contrast enhancement using unsharp mask
    # This brings out local texture detail
    local_contrast = gray.filter(ImageFilter.UnsharpMask(radius=3, percent=200, threshold=2))

    # Step 2: Apply histogram equalization to spread values evenly
    equalized = ImageOps.equalize(local_contrast)

    # Step 3: Apply edge enhancement to make features pop
    edge_enhanced = equalized.filter(ImageFilter.EDGE_ENHANCE_MORE)

    # Step 4: Blend original detail with edge enhancement (70% detail, 30% edges)
    # This preserves subtle gradients while making features visible
    blended = Image.blend(equalized, edge_enhanced, 0.3)

    # Step 5: Final contrast boost
    enhancer = ImageEnhance.Contrast(blended)
    final_gray = enhancer.enhance(1.2)

    # Create output
    output = Image.new('RGBA', (width, height))

    pixels_in = img.load()
    gray_pixels = final_gray.load()
    pixels_out = output.load()

    # Collect all non-water luminosity values for normalization
    land_values = []
    land_coords = []

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels_in[x, y]

            # Detect blue background (water)
            is_blue_bg = (b > 140 and b > r + 15 and b > g - 10 and r < 180 and g < 200)
            is_light_blue = (b > 180 and r > 140 and g > 160 and b > r and b > g)

            if not (is_blue_bg or is_light_blue or a < 50):
                land_values.append(gray_pixels[x, y])
                land_coords.append((x, y))

    if not land_values:
        print("Error: No land pixels found!")
        return

    # Calculate min/max for normalization
    min_val = min(land_values)
    max_val = max(land_values)
    val_range = max_val - min_val if max_val > min_val else 1

    print(f"Land luminosity range: {min_val} - {max_val}")
    print(f"Land pixels: {len(land_values)}")

    # Map to terrain range 140-200 with full spread
    terrain_min = 140
    terrain_max = 200
    terrain_range = terrain_max - terrain_min

    water_count = 0

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels_in[x, y]

            # Detect blue background
            is_blue_bg = (b > 140 and b > r + 15 and b > g - 10 and r < 180 and g < 200)
            is_light_blue = (b > 180 and r > 140 and g > 160 and b > r and b > g)

            if is_blue_bg or is_light_blue or a < 50:
                # Water - transparent
                pixels_out[x, y] = (0, 0, 50, 0)
                water_count += 1
            else:
                # Land - normalize to full terrain range
                lum = gray_pixels[x, y]

                # Normalize to 0-1
                normalized = (lum - min_val) / val_range

                # Invert so darker areas = higher elevation
                # (hair, eyes, shadows become mountains)
                inverted = 1.0 - normalized

                # Apply slight gamma curve to enhance mid-tones
                # This gives more variation in the middle terrain types
                gamma = 0.9
                curved = pow(inverted, gamma)

                # Map to terrain range
                terrain = int(terrain_min + curved * terrain_range)
                terrain = max(terrain_min, min(terrain_max, terrain))

                pixels_out[x, y] = (terrain, terrain, terrain, 255)

    output.save(output_path, 'PNG')

    print(f"Water: {water_count} ({water_count * 100 / (width * height):.1f}%)")
    print(f"Land: {width * height - water_count}")
    print(f"Saved: {output_path}")


def create_maximum_detail_map(input_path, output_path):
    """
    Alternative: Maximum detail preservation using multiple processing passes.
    """

    img = Image.open(input_path)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    width, height = img.size
    print(f"Maximum detail processing: {width}x{height}")

    # Convert to grayscale
    gray = img.convert('L')

    # Pass 1: Local contrast enhancement (brings out texture)
    local = gray.filter(ImageFilter.UnsharpMask(radius=2, percent=150, threshold=1))

    # Pass 2: Multi-scale detail extraction
    # Blur at different scales and subtract to get detail layers
    blur_small = gray.filter(ImageFilter.GaussianBlur(radius=1))
    blur_medium = gray.filter(ImageFilter.GaussianBlur(radius=3))

    # Pass 3: Edge detection for structural features
    edges = gray.filter(ImageFilter.FIND_EDGES)
    edges = ImageOps.autocontrast(edges)

    # Combine layers
    output = Image.new('RGBA', (width, height))

    pixels_in = img.load()
    local_px = local.load()
    blur_s = blur_small.load()
    blur_m = blur_medium.load()
    edge_px = edges.load()
    pixels_out = output.load()

    # First pass: collect land pixel values
    land_values = []

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels_in[x, y]
            is_water = (b > 140 and b > r + 15 and b > g - 10 and r < 180 and g < 200) or \
                       (b > 180 and r > 140 and g > 160 and b > r and b > g) or a < 50

            if not is_water:
                # Combine multiple detail layers
                base = local_px[x, y]
                fine_detail = blur_s[x, y] - blur_m[x, y] + 128  # High-frequency detail
                edge = edge_px[x, y]

                # Weighted combination
                combined = int(base * 0.6 + fine_detail * 0.25 + edge * 0.15)
                combined = max(0, min(255, combined))
                land_values.append(combined)

    if not land_values:
        print("Error: No land found")
        return

    min_val = min(land_values)
    max_val = max(land_values)
    val_range = max_val - min_val if max_val > min_val else 1

    print(f"Combined value range: {min_val} - {max_val}")

    # Second pass: generate terrain
    water_count = 0
    idx = 0

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels_in[x, y]
            is_water = (b > 140 and b > r + 15 and b > g - 10 and r < 180 and g < 200) or \
                       (b > 180 and r > 140 and g > 160 and b > r and b > g) or a < 50

            if is_water:
                pixels_out[x, y] = (0, 0, 50, 0)
                water_count += 1
            else:
                # Recalculate combined value
                base = local_px[x, y]
                fine_detail = blur_s[x, y] - blur_m[x, y] + 128
                edge = edge_px[x, y]
                combined = int(base * 0.6 + fine_detail * 0.25 + edge * 0.15)
                combined = max(0, min(255, combined))

                # Normalize and invert
                normalized = (combined - min_val) / val_range
                inverted = 1.0 - normalized

                # Map to 140-200 range
                terrain = int(140 + inverted * 60)
                terrain = max(140, min(200, terrain))

                pixels_out[x, y] = (terrain, terrain, terrain, 255)

    output.save(output_path, 'PNG')
    print(f"Water: {water_count}, Land: {width * height - water_count}")
    print(f"Saved: {output_path}")


if __name__ == "__main__":
    input_file = sys.argv[1] if len(sys.argv) > 1 else "julie2.png"
    output_file = "image.png"

    # Use the subtle terrain approach
    print("=== Subtle Terrain Generation ===")
    create_subtle_terrain_map(input_file, output_file)
