Module.register("MMM-VinylCollection", {

  defaults: {
    username: "",
    token: "",
    updateInterval: 43200000,
    randomAlbumInterval: 900000,
    language: null // 🔥 override språk
  },

  getTranslations() {
    return {
      en: "translations/en.json",
      sv: "translations/sv.json",
      de: "translations/de.json"
    };
  },

  start() {

    this.collection = [];
    this.stats = null;
    this.randomAlbum = null;
    this.todayAlbum = null;

    this.translationsData = {};

    this.loadTranslations(() => {
      this.getData();
    });

    setInterval(() => {
      this.getData();
    }, this.config.updateInterval);

    setInterval(() => {
      this.updateRandomAlbum();
    }, this.config.randomAlbumInterval);

  },

  // 🔥 Ladda språkfiler manuellt
  loadTranslations(callback) {

    const files = this.getTranslations();
    const languages = Object.keys(files);
    let loaded = 0;

    languages.forEach(lang => {
      fetch(this.file(files[lang]))
        .then(res => res.json())
        .then(data => {
          this.translationsData[lang] = data;
        })
        .catch(() => {
          this.translationsData[lang] = {};
        })
        .finally(() => {
          loaded++;
          if (loaded === languages.length && callback) {
            callback();
          }
        });
    });

  },

  // 🔥 egen translate som RESPEKTERAR override
  t(key) {

    const globalLang = config.language || "en";
    const lang = this.config.language || globalLang;

    const langData = this.translationsData[lang];
    const fallbackData = this.translationsData[globalLang];
    const enData = this.translationsData["en"];

    return (
      langData?.[key] ||
      fallbackData?.[key] ||
      enData?.[key] ||
      key
    );

  },

  updateRandomAlbum() {

    if (!this.collection || this.collection.length === 0) return;

    const index = Math.floor(Math.random() * this.collection.length);
    this.randomAlbum = this.collection[index];

    this.updateDom(1000);

  },

  getData() {

    this.sendSocketNotification("GET_COLLECTION", {
      username: this.config.username,
      token: this.config.token
    });

  },

  socketNotificationReceived(notification, payload) {

    if (notification === "COLLECTION_RESULT") {

      this.collection = payload.collection || [];
      this.stats = payload.stats || {};
      this.randomAlbum = payload.randomAlbum || null;
      this.todayAlbum = payload.todayAlbum || null;

      this.updateDom(1000);

    }

  },

  getDom() {

    const wrapper = document.createElement("div");
    wrapper.className = "vinyl-wrapper";

    if (!this.stats) {
      wrapper.innerHTML = this.t("LOADING");
      return wrapper;
    }

    const maxArtist = this.stats.topArtists?.[0]?.count || 1;

    const todayCover = this.todayAlbum?.cover || "";
    const todayArtist = this.todayAlbum?.artist || "-";
    const todayTitle = this.todayAlbum?.title || "-";

    const randomCover = this.randomAlbum?.cover || "";
    const randomArtist = this.randomAlbum?.artist || "-";
    const randomTitle = this.randomAlbum?.title || "-";

    const latestCover = this.stats.latest?.cover || "";
    const latestArtist = this.stats.latest?.artist || "-";
    const latestTitle = this.stats.latest?.title || "-";

    const topArtistsHtml = (this.stats.topArtists || []).map((a) => {

      const width = Math.round((a.count / maxArtist) * 100);

      return `
        <div class="artist-row">
          <div class="artist-name">${a.name}</div>
          <div class="artist-bar">
            <div class="artist-fill" style="width:${width}%"></div>
          </div>
          <div class="artist-count">${a.count}</div>
        </div>
      `;

    }).join("");

    wrapper.innerHTML = `

      <div class="vinyl-header">${this.t("TITLE")}</div>

      <div class="vinyl-section">
        <div class="vinyl-label">${this.t("TODAY")}</div>

        <div class="vinyl-row">
          ${todayCover ? `<img src="${todayCover}" class="vinyl-cover">` : ""}
          <div class="vinyl-text">
            <div class="vinyl-artist">${todayArtist}</div>
            <div class="vinyl-album">${todayTitle}</div>
          </div>
        </div>
      </div>

      <div class="vinyl-section">
        <div class="vinyl-label">${this.t("RANDOM")}</div>

        <div class="vinyl-row">
          ${randomCover ? `<img src="${randomCover}" class="vinyl-cover">` : ""}
          <div class="vinyl-text">
            <div class="vinyl-artist">${randomArtist}</div>
            <div class="vinyl-album">${randomTitle}</div>
          </div>
        </div>
      </div>

      <div class="vinyl-section">
        <div class="vinyl-label">${this.t("LATEST")}</div>

        <div class="vinyl-row">
          ${latestCover ? `<img src="${latestCover}" class="vinyl-cover">` : ""}
          <div class="vinyl-text">
            <div class="vinyl-artist">${latestArtist}</div>
            <div class="vinyl-album">${latestTitle}</div>
          </div>
        </div>
      </div>

      <div class="vinyl-section">
        <div class="vinyl-label">${this.t("TOP_ARTISTS")}</div>
        ${topArtistsHtml}
      </div>

      <div class="vinyl-section">

        <div class="vinyl-label">${this.t("STATS")}</div>

        <div class="vinyl-stats">

          <div><span>${this.t("RECORDS")}</span><span>${this.stats.total || 0}</span></div>
          <div><span>${this.t("ARTISTS")}</span><span>${this.stats.artists || 0}</span></div>
          <div><span>${this.t("BOUGHT")}</span><span>${this.stats.boughtThisYear || 0}</span></div>
          <div><span>${this.t("OLDEST")}</span><span>${this.stats.oldest || "-"}</span></div>
          <div><span>${this.t("NEWEST")}</span><span>${this.stats.newest || "-"}</span></div>
          <div><span>${this.t("GENRE")}</span><span>${this.stats.topGenre?.name || "-"}</span></div>

        </div>

      </div>

    `;

    return wrapper;

  },

  getStyles() {
    return ["vinyl.css"];
  }

});
