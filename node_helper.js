const NodeHelper = require("node_helper");
const axios = require("axios");

module.exports = NodeHelper.create({
  start: function () {
    console.log("[MMM-PronoteHA] node_helper started");
  },

  socketNotificationReceived: async function (notification, config) {
    if (notification === "PRONOTE_HA_INIT" || notification === "PRONOTE_HA_REFRESH") {
      try {
        const data = await this.fetchHomeAssistantData(config);
        this.sendSocketNotification("PRONOTE_HA_DATA", data);
      } catch (error) {
        console.error("[MMM-PronoteHA] Error:", error.message);
        this.sendSocketNotification("PRONOTE_HA_DATA", {
          syncedAt: "--:--",
          children: []
        });
      }
    }
  },

  async fetchEntity(baseUrl, token, entityId) {
    const url = `${baseUrl.replace(/\/$/, "")}/api/states/${entityId}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      timeout: 10000
    });
    return response.data;
  },

  nowHHMM() {
    return new Date().toTimeString().slice(0, 5);
  },

  async fetchHomeAssistantData(config) {
    const children = [];

    for (const childConfig of config.children) {
      const homeworkEntity = await this.fetchEntity(
        config.homeAssistantUrl,
        config.accessToken,
        childConfig.entities.homework
      );

      const timetableTodayEntity = await this.fetchEntity(
        config.homeAssistantUrl,
        config.accessToken,
        childConfig.entities.timetableToday
      );

      const timetableTomorrowEntity = await this.fetchEntity(
        config.homeAssistantUrl,
        config.accessToken,
        childConfig.entities.timetableTomorrow
      );

      children.push({
        id: childConfig.id,
        name: childConfig.name,
        homework: homeworkEntity.attributes.homework || [],
        timetableToday: timetableTodayEntity.attributes.lessons || [],
        timetableTomorrow: timetableTomorrowEntity.attributes.lessons || []
      });
    }

    return {
      syncedAt: this.nowHHMM(),
      children
    };
  }
});