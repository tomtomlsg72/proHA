nano Module.register("MMM-PronoteHA", {
  defaults: {
    title: "PRONOTE",
    updateInterval: 15 * 60 * 1000,
    animationSpeed: 400,
    selectedChild: 0,
    selectedDayOffset: 1,
    homeAssistantUrl: "http://homeassistant.local:8123",
    accessToken: "",
    showGrades: false,
    showHomework: true,
    showTimetable: true,
    children: [
      {
        id: "jade",
        name: "JADE",
        entities: {
          homework: "sensor.pronote_.............._jade_homework",
          timetableToday: "sensor.pronote_......._jade_today_s_timetable",
          timetableTomorrow: "sensor.pronote_.............._jade_tomorrow_s_timetable"
        }
      },
      {
        id: "alya",
        name: "ALYA",
        entities: {
          homework: "sensor.pronote_..........._alya_homework",
          timetableToday: "sensor.pronote_........._alya_today_s_timetable",
          timetableTomorrow: "sensor.pronote_.............._alya_tomorrow_s_timetable"
        }
      }
    ]
  },

  start: function () {
    this.loaded = false;
    this.pronoteData = null;
    this.selectedChild = this.config.selectedChild || 0;
    this.selectedDayOffset = this.config.selectedDayOffset || 1;

    this.sendSocketNotification("PRONOTE_HA_INIT", this.config);
    this.scheduleUpdate();
  },

  scheduleUpdate: function () {
    setInterval(() => {
      this.sendSocketNotification("PRONOTE_HA_REFRESH", this.config);
    }, this.config.updateInterval);
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "PRONOTE_HA_DATA") {
      this.pronoteData = payload;
      this.loaded = true;
      this.updateDom(this.config.animationSpeed);
    }
  },

  getStyles: function () {
    return ["MMM-PronoteHA.css"];
  },

  getDom: function () {
    const wrapper = document.createElement("div");
    wrapper.className = "pp-card";

    if (!this.loaded || !this.pronoteData) {
      wrapper.innerHTML = `<div class="dimmed light small">Chargement Pronote via Home Assistant...</div>`;
      return wrapper;
    }

    const children = this.pronoteData.children || [];
    if (!children.length) {
      wrapper.innerHTML = `<div class="dimmed light small">Aucune donnée disponible.</div>`;
      return wrapper;
    }

    if (this.selectedChild >= children.length) this.selectedChild = 0;
    const child = children[this.selectedChild];

    wrapper.appendChild(this.renderHeader());
    wrapper.appendChild(this.renderTabs(children));

    if (this.config.showTimetable) {
      wrapper.appendChild(this.renderTimetable(child));
    }

    if (this.config.showHomework) {
      wrapper.appendChild(this.renderHomework(child));
    }

    if (this.config.showGrades) {
      wrapper.appendChild(this.renderGradesPlaceholder());
    }

    return wrapper;
  },

  renderHeader: function () {
    const header = document.createElement("div");
    header.className = "pp-header";

    const title = document.createElement("div");
    title.className = "pp-title";
    title.innerHTML = `<span class="pp-badge">P</span>${this.config.title}`;

    const sync = document.createElement("div");
    sync.className = "pp-sync";
    sync.textContent = `SYNCHRO ${this.pronoteData.syncedAt || "--:--"}`;

    header.appendChild(title);
    header.appendChild(sync);

    return header;
  },

  renderTabs: function (children) {
    const tabs = document.createElement("div");
    tabs.className = "pp-tabs";

    children.forEach((child, index) => {
      const btn = document.createElement("button");
      btn.className = "pp-tab" + (index === this.selectedChild ? " active" : "");
      btn.textContent = child.name;
      btn.onclick = () => {
        this.selectedChild = index;
        this.selectedDayOffset = 1;
        this.updateDom(this.config.animationSpeed);
      };
      tabs.appendChild(btn);
    });

    return tabs;
  },

  renderTimetable: function (child) {
    const section = document.createElement("div");
    section.className = "pp-section";

    const top = document.createElement("div");
    top.className = "pp-section-title pp-nav";

    const left = document.createElement("button");
    left.className = "pp-nav-btn";
    left.textContent = "◀";
    left.onclick = () => {
      this.selectedDayOffset = Math.max(0, this.selectedDayOffset - 1);
      this.updateDom(this.config.animationSpeed);
    };

    const label = document.createElement("div");
    label.className = "pp-nav-label";
    label.textContent = `EMPLOI DU TEMPS · ${this.selectedDayOffset === 0 ? "Aujourd'hui" : "Demain"}`;

    const right = document.createElement("button");
    right.className = "pp-nav-btn";
    right.textContent = "▶";
    right.onclick = () => {
      this.selectedDayOffset = Math.min(1, this.selectedDayOffset + 1);
      this.updateDom(this.config.animationSpeed);
    };

    top.appendChild(left);
    top.appendChild(label);
    top.appendChild(right);
    section.appendChild(top);

    const lessons = this.selectedDayOffset === 0
      ? (child.timetableToday || [])
      : (child.timetableTomorrow || []);

    if (!lessons.length) {
      section.appendChild(this.renderEmpty("Aucun cours"));
      return section;
    }

    lessons.forEach((lesson) => {
      const item = document.createElement("div");
      item.className = "pp-item";

      const color = document.createElement("div");
      color.className = "pp-dot";
      color.style.background = lesson.background_color || "#18e2a3";

      const main = document.createElement("div");
      main.className = "pp-item-main";

      const title = document.createElement("div");
      title.className = "pp-item-title";
      title.textContent = lesson.lesson || "Cours";

      const sub = document.createElement("div");
      sub.className = "pp-item-sub";

      const details = [
        lesson.start_time && lesson.end_time ? `${lesson.start_time} - ${lesson.end_time}` : null,
        lesson.classroom ? `Salle ${lesson.classroom}` : null,
        lesson.teacher_name || null,
        lesson.status || null
      ].filter(Boolean);

      sub.textContent = details.join(" · ");

      main.appendChild(title);
      main.appendChild(sub);

      item.appendChild(color);
      item.appendChild(main);

      section.appendChild(item);
    });

    return section;
  },

  renderHomework: function (child) {
    const section = document.createElement("div");
    section.className = "pp-section";

    const title = document.createElement("div");
    title.className = "pp-section-title";
    title.textContent = `DEVOIRS À FAIRE · ${this.formatHomeworkDayLabel(this.selectedDayOffset)}`;
    section.appendChild(title);

    const targetDate = this.getTargetDate(this.selectedDayOffset);
    const homework = (child.homework || []).filter(hw => hw.date === targetDate);

    if (!homework.length) {
      section.appendChild(this.renderEmpty("Aucun devoir"));
      return section;
    }

    homework.forEach((hw) => {
      const item = document.createElement("div");
      item.className = "pp-item";

      const dot = document.createElement("div");
      dot.className = "pp-dot";
      dot.style.background = hw.background_color || (hw.done ? "#6c757d" : "#18e2a3");

      const main = document.createElement("div");
      main.className = "pp-item-main";

      const hTitle = document.createElement("div");
      hTitle.className = "pp-item-title";
      hTitle.textContent = hw.subject || "Devoir";

      const hSub = document.createElement("div");
      hSub.className = "pp-item-sub";
      hSub.textContent = hw.short_description || hw.description || "";

      const status = document.createElement("div");
      status.className = "pp-item-day";
      status.textContent = hw.done ? "Fait" : this.shortRelativeDay(this.selectedDayOffset);

      main.appendChild(hTitle);
      main.appendChild(hSub);

      item.appendChild(dot);
      item.appendChild(main);
      item.appendChild(status);

      section.appendChild(item);
    });

    return section;
  },

  renderGradesPlaceholder: function () {
    const section = document.createElement("div");
    section.className = "pp-section";

    const title = document.createElement("div");
    title.className = "pp-section-title";
    title.textContent = "DERNIÈRES NOTES";
    section.appendChild(title);

    section.appendChild(this.renderEmpty("Entités de notes Home Assistant non configurées"));
    return section;
  },

  renderEmpty: function (text) {
    const item = document.createElement("div");
    item.className = "pp-item dimmed";
    item.textContent = text;
    return item;
  },

  getTargetDate: function (offset) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  },

  formatHomeworkDayLabel: function (offset) {
    if (offset === 0) return "Aujourd'hui";
    if (offset === 1) return "Demain";
    if (offset === 2) return "Après-demain";

    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit"
    });
  },

  shortRelativeDay: function (offset) {
    if (offset === 0) return "Auj.";
    if (offset === 1) return "Demain";
    if (offset === 2) return "Après-demain";
    return `J+${offset}`;
  }
});
