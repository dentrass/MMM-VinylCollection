# MMM-VinylCollection

MagicMirror² module that displays your Discogs vinyl collection with stats, random album and today's pick.

## Features

* 📀 Today's vinyl
* 🎲 Random album
* 🆕 Latest added
* 📊 Statistics
* 🎤 Top artists

## Installation

```bash
cd ~/MagicMirror/modules
git clone https://github.com/dentrass/MMM-VinylCollection.git
cd MMM-VinylCollection
npm install
```

## Configuration

Add this to your `config.js`:

```javascript
{
  module: "MMM-VinylCollection",
  position: "top_right",
  config: {
    username: "YOUR_DISCOGS_USERNAME",
    token: "YOUR_DISCOGS_TOKEN"
  }
}
```

## Get Discogs Token

Go to: https://www.discogs.com/settings/developers

## Dependencies

* axios

## Author

dentrass
