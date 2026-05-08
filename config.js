{
  module: "MMM-PronoteHA",
  position: "top_right",
  config: {
    title: "PRONOTE",
    homeAssistantUrl: "URL Home Assistant",
    accessToken: "TOKEN",
    updateInterval: 15 * 60 * 1000,
    selectedChild: 0,
    selectedDayOffset: 1,
    showTimetable: true,
    showHomework: true,
    showGrades: false,
    children: [
      {
        id: "jade",
        name: "JADE",
        entities: {
          homework: "sensor.pronote_.................s_jade_homework",
          timetableToday: "sensor.pronote_................._jade_today_s_timetable",
          timetableTomorrow: "sensor.pronote_.............._jade_tomorrow_s_timetable"
        }
      },
      {
        id: "alya",
        name: "ALYA",
        entities: {
          homework: "sensor.pronote_............._alya_homework",
          timetableToday: "sensor.pronote_..............._alya_today_s_timetable",
          timetableTomorrow: "sensor.pronote_................_alya_tomorrow_s_timetable"
        }
      }
    ]
  }
}
