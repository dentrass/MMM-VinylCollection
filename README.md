# 💿 MMM-VinylCollection

![MagicMirror](https://img.shields.io/badge/MagicMirror²-Module-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-lightgrey)
![Maintenance](https://img.shields.io/badge/maintained-yes-brightgreen)

A **MagicMirror² module** that displays your Discogs vinyl collection in a clean and modern UI.

---

## ✨ Features

* 📀 **Today's Vinyl** – automatic daily pick
* 🎲 **Random Album** – rotates automatically
* 🆕 **Latest Added Record**
* 🎤 **Top Artists** with visual bars
* 📊 **Collection Statistics**
* 🎨 Clean glass-style design

---

## 📸 Preview

<img width="357" height="889" alt="screenshot" src="https://github.com/user-attachments/assets/9f67d3db-09b8-4300-b799-9a2302f7d736" />

---

## 🚀 Installation

```bash
cd ~/MagicMirror/modules
git clone https://github.com/dentrass/MMM-VinylCollection.git
cd MMM-VinylCollection
npm install
```

---

## ⚙️ Configuration

Add this to your `config.js`:

```javascript
{
  module: "MMM-VinylCollection",
  position: "top_right",
  config: {
    username: "YOUR_DISCOGS_USERNAME",
    token: "YOUR_DISCOGS_TOKEN",
    updateInterval: 43200000,
    randomAlbumInterval: 900000
  }
}
```

---

## 🔑 Discogs API Token

1. Go to: https://www.discogs.com/settings/developers
2. Generate a token
3. Paste it into your config

---

## 📦 Dependencies

* axios

Installed automatically via:

```bash
npm install
```

---

## 🧠 How it works

* Fetches your Discogs collection via API
* Calculates:

  * Top artists
  * Genres
  * Stats
* Displays dynamic content in the module

---

## 🎨 Styling

Custom styling is included via:

```
vinyl.css
```

You can override styles in your `custom.css` if needed.

---

## 🔄 Update

```bash
cd ~/MagicMirror/modules/MMM-VinylCollection
git pull
npm install
```

---

## 🤝 Contributing

Pull requests are welcome!
Feel free to suggest improvements or features.

---

## 📄 License

MIT License

---

## 👤 Author

**dentrass**

---

## ⭐ Support

If you like this module:

👉 Star the repo
👉 Share it with other MagicMirror users

---
