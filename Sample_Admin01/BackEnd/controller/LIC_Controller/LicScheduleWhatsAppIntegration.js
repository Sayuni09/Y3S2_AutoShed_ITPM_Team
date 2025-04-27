const { sendScheduleWhatsAppNotifications } = require('../WhatsAppController');

// Integration function for new schedule creation
const notifyOnNewScheduleViaWhatsApp = async (scheduleId) => {
  try {
    const result = await sendScheduleWhatsAppNotifications(scheduleId, false);
    return result;
  } catch (error) {
    console.error("Error in schedule WhatsApp notification integration:", error);
    return { success: false, error: error.message };
  }
};

// Integration function for schedule updates
const notifyOnScheduleUpdateViaWhatsApp = async (scheduleId, changes) => {
  try {
    const result = await sendScheduleWhatsAppNotifications(scheduleId, true, changes);
    return result;
  } catch (error) {
    console.error("Error in schedule update WhatsApp notification integration:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  notifyOnNewScheduleViaWhatsApp,
  notifyOnScheduleUpdateViaWhatsApp
};
