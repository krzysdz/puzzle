# Puzzle (Puzzle Edukacyjne)
Simple electron app in which you can create puzzles from image.

## Installation
This app can be installed in 3 ways:

- using prebuilt binaries
- starting Electron from source code
- building and installing own binaries

### Prebuilt binaries
Download proper installer for your OS from [releases](https://github.com/krzysdz/puzzle/releases).
Open the downloaded installer and follow the instructions.

### Running from command line
```bash
# Clone repository from GitHub
git clone https://github.com/krzysdz/puzzle.git
# Change directory to downloaded repo
cd puzzle
# Script executing "npm install && npx electron ."
npm start
```

### Building binaries
You can build binaries from source code. Binaries will be placed in `dist/` directory

#### Linux & Windows
To build binaries for Linux (using remote build service on Windows) and Windows (using Wine on Linux)
```bash
npm run dist
```
***Note:** to build `rpm` on MacOS you need to install rpm usin [brew](https://brew.sh/) (`brew install rpm`)*

#### MacOS
This command will build binaries only for MacOS (zip + dmg)
```bash
npm run dist-mac
```
***Note:** binaries for MacOS can be built **only on MacOS***

See: https://www.electron.build/multi-platform-build for more info

## Usage
Before you start playing (or show the app to the children) you have to prepare an image

### Preparing image
1. Select an image by clicking "Kliknij aby wybrać plik" button (`.png`, `.jpg` and `.jpeg` are accepted)
2. To draw rectangles click on the image and move the cursor
3. When you release mouse button a rectangle will be drawn (it will cover all empty squares within selection)
4. You can use pattern - draw a rectangle with which you want to fill the image in pattern area. Click "Narysuj wzór" to fill the image with pattern. If you want to change pattern (clear pattern box) click "Wyczyść pole".
5. If you want to remove all rectangles from image (just reset it), click "Resetuj wszystko"

### Playing
In order to start playing you have to click "Graj" after [preparing image](#preparing-image)

To remove a rectangle doubleclick the rectangle you want to remove, its number or its entry on "Legenda:" list below the image

#### Example game
After preparing the image show it to the children (students). They will then tell you which rectangle to remove. While you are removing rectangles the children try to guess what's on the image below. The first one who guesses wins.
