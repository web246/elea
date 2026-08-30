Download images for ELEA site

This folder contains a small PowerShell script to download the images referenced by the home and services pages.

How to run (Windows PowerShell):

1. Open PowerShell in the project root (the folder that contains `index.html`).
2. Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\assets\download-images.ps1
```

The script will create `assets/images/` and download the images with the filenames used by the site:
- hero.png
- wardrobe.png
- bathroom.png
- kitchen.png
- moveIn.png
- moveOut.png
- afterReno.png
- oven.png
- laundry.png
- window.png
- living.png
- bedroom.png

After running, the site pages (`index.html`, `services.html`) have been updated to reference the local `assets/images/*.png` files.

If you prefer to download manually, save each URL into `assets/images/` using the filenames above (URLs are documented in the project root README or commit message).