{
  module: "MMM-PronoteHA",
  position: "top_right",
  config: {
    title: "PRONOTE",
    homeAssistantUrl: "http://192.168.1.152:8123",
    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI2YjM0NWE3NWZkZWM0Njc1OTI1MDFiMzdmMjM1NTFhYiIsImlhdCI6MTc3NTU3MDcwNSwiZXhwIjoyMDkwOTMwNzA1fQ.v6OQWDMW3EuA-cQotcnzCZboLtpMe3ezANFj36shPG4",
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
          homework: "sensor.pronote_leperchey_gomas_jade_homework",
          timetableToday: "sensor.pronote_leperchey_gomas_jade_today_s_timetable",
          timetableTomorrow: "sensor.pronote_leperchey_gomas_jade_tomorrow_s_timetable"
        }
      },
      {
        id: "alya",
        name: "ALYA",
        entities: {
          homework: "sensor.pronote_leperchey_gomas_alya_homework",
          timetableToday: "sensor.pronote_leperchey_gomas_alya_today_s_timetable",
          timetableTomorrow: "sensor.pronote_leperchey_gomas_alya_tomorrow_s_timetable"
        }
      }
    ]
  }
}