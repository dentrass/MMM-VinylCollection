Module.register("MMM-VinylCollection", {

  defaults: {
    username: "",
    token: "",
    updateInterval: 43200000,
    randomAlbumInterval: 900000
  },

  start() {

    this.collection = [];
    this.stats = null;
    this.randomAlbum = null;
    this.todayAlbum = null;

    this.getData();

    setInterval(() => {
      this.getData();
    }, this.config.updateInterval);

    setInterval(() => {
      this.updateRandomAlbum();
    }, this.config.randomAlbumInterval);

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
      wrapper.innerHTML = "Laddar vinylsamling...";
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

      <div class="vinyl-header">VINYLSAMLINGEN</div>

      <div class="vinyl-section">
        <div class="vinyl-label">DAGENS VINYL</div>

        <div class="vinyl-row">
          ${todayCover ? `<img src="${todayCover}" class="vinyl-cover">` : ""}
          <div class="vinyl-text">
            <div class="vinyl-artist">${todayArtist}</div>
            <div class="vinyl-album">${todayTitle}</div>
          </div>
        </div>
      </div>


      <div class="vinyl-section">
        <div class="vinyl-label">SLUMPAT ALBUM</div>

        <div class="vinyl-row">
          ${randomCover ? `<img src="${randomCover}" class="vinyl-cover">` : ""}
          <div class="vinyl-text">
            <div class="vinyl-artist">${randomArtist}</div>
            <div class="vinyl-album">${randomTitle}</div>
          </div>
        </div>
      </div>


      <div class="vinyl-section">
        <div class="vinyl-label">SENAST TILLAGD</div>

        <div class="vinyl-row">
          ${latestCover ? `<img src="${latestCover}" class="vinyl-cover">` : ""}
          <div class="vinyl-text">
            <div class="vinyl-artist">${latestArtist}</div>
            <div class="vinyl-album">${latestTitle}</div>
          </div>
        </div>
      </div>


      <div class="vinyl-section">
        <div class="vinyl-label">TOPPARTISTER</div>
        ${topArtistsHtml}
      </div>


      <div class="vinyl-section">

        <div class="vinyl-label">STATISTIK</div>

        <div class="vinyl-stats">

          <div><span>Skivor</span><span>${this.stats.total || 0}</span></div>
          <div><span>Artister</span><span>${this.stats.artists || 0}</span></div>
          <div><span>Köpta i år</span><span>${this.stats.boughtThisYear || 0}</span></div>
          <div><span>Äldsta</span><span>${this.stats.oldest || "-"}</span></div>
          <div><span>Nyaste</span><span>${this.stats.newest || "-"}</span></div>
          <div><span>Vanligaste genre</span><span>${this.stats.topGenre?.name || "-"}</span></div>

        </div>

      </div>

    `;

    return wrapper;

  },

  getStyles() {
    return ["vinyl.css"];
  }

});