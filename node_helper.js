const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({

  start() {
    this.cache = null;
    this.lastFetch = 0;

    // 6 timmar cache (kan justeras)
    this.cacheDuration = 1000 * 60 * 60 * 6;
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "GET_COLLECTION") {
      this.getCollection(payload);
    }
  },

  async getCollection(payload) {

    const now = Date.now();

    // ✅ Använd cache om den är giltig
    if (this.cache && (now - this.lastFetch < this.cacheDuration)) {
      console.log("VinylCollection: använder cache");
      this.sendSocketNotification("COLLECTION_RESULT", this.cache);
      return;
    }

    console.log("VinylCollection: hämtar från Discogs API");

    try {

      const headers = {
        "User-Agent": "MagicMirror-VinylCollection/1.0"
      };

      let page = 1;
      let pages = 1;
      let releases = [];

      do {

        const url = `https://api.discogs.com/users/${payload.username}/collection/folders/0/releases?page=${page}&per_page=100&token=${payload.token}`;

        const res = await fetch(url, { headers });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        releases = releases.concat(data.releases || []);
        pages = data.pagination?.pages || 1;
        page++;

      } while (page <= pages);


      const collection = releases.map(r => ({
        artist: r.basic_information?.artists?.[0]?.name || "Okänd artist",
        title: r.basic_information?.title || "Okänd titel",
        year: r.basic_information?.year || 0,
        cover: r.basic_information?.cover_image || "",
        genres: r.basic_information?.genres || [],
        date_added: r.date_added || null
      }));


      const artists = {};
      const genres = {};

      let oldest = 3000;
      let newest = 0;
      let latest = null;

      let boughtThisYear = 0;
      const currentYear = new Date().getFullYear();


      collection.forEach(r => {

        if (r.artist && r.artist !== "Various") {
          artists[r.artist] = (artists[r.artist] || 0) + 1;
        }

        (r.genres || []).forEach(g => {
          genres[g] = (genres[g] || 0) + 1;
        });

        if (r.year && r.year < oldest) oldest = r.year;
        if (r.year && r.year > newest) newest = r.year;

        if (r.date_added) {

          const addedYear = new Date(r.date_added).getFullYear();
          if (addedYear === currentYear) {
            boughtThisYear++;
          }

          if (!latest || new Date(r.date_added) > new Date(latest.date_added)) {
            latest = r;
          }

        }

      });


      const topArtists = Object.entries(artists)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);


      const topGenre = Object.entries(genres)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)[0] || null;


      const start = new Date(new Date().getFullYear(), 0, 0);
      const diff = new Date() - start;
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);

      const todayAlbum = collection.length
        ? collection[dayOfYear % collection.length]
        : null;

      const randomAlbum = collection.length
        ? collection[Math.floor(Math.random() * collection.length)]
        : null;


      const result = {
        collection,
        stats: {
          total: collection.length,
          artists: Object.keys(artists).length,
          oldest: oldest === 3000 ? "-" : oldest,
          newest: newest === 0 ? "-" : newest,
          topArtists,
          topGenre,
          latest,
          boughtThisYear
        },
        randomAlbum,
        todayAlbum
      };

      // ✅ Spara cache
      this.cache = result;
      this.lastFetch = now;

      this.sendSocketNotification("COLLECTION_RESULT", result);

    } catch (err) {

      console.log("Discogs error:", err.message);

      // ⚠️ Om fel → använd gammal cache om den finns
      if (this.cache) {
        console.log("VinylCollection: använder gammal cache pga fel");
        this.sendSocketNotification("COLLECTION_RESULT", this.cache);
        return;
      }

      this.sendSocketNotification("COLLECTION_RESULT", {
        collection: [],
        stats: {
          total: 0,
          artists: 0,
          oldest: "-",
          newest: "-",
          topArtists: [],
          topGenre: null,
          latest: null,
          boughtThisYear: 0
        },
        randomAlbum: null,
        todayAlbum: null
      });

    }

  }

});
