const { sendScheduleNotifications } = require('../EmailController');

// Integration function for new schedule creation
const notifyOnNewSchedule = async (scheduleId) => {
  try {
    const result = await sendScheduleNotifications(scheduleId, false);
    return result;
  } catch (error) {
    console.error("Error in schedule notification integration:", error);
    return { success: false, error: error.message };
  }
};

// Integration function for schedule updates
const notifyOnScheduleUpdate = async (scheduleId, changes) => {
  try {
    const result = await sendScheduleNotifications(scheduleId, true, changes);
    return result;
  } catch (error) {
    console.error("Error in schedule update notification integration:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  notifyOnNewSchedule,
  notifyOnScheduleUpdate
};

