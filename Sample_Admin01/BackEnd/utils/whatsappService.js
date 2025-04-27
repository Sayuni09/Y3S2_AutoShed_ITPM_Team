const axios = require('axios');
require('dotenv').config();

// Green API credentials from environment variables
const ID_INSTANCE = process.env.GREEN_API_ID_INSTANCE;
const API_TOKEN_INSTANCE = process.env.GREEN_API_TOKEN_INSTANCE;

// Function to send WhatsApp message
const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    // Format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Endpoint for sending messages
    const endpoint = `https://api.green-api.com/waInstance${ID_INSTANCE}/sendMessage/${API_TOKEN_INSTANCE}`;
    
    // Prepare data for the request
    const data = {
      chatId: `${formattedPhone}@c.us`,
      message
    };
    
    // Send the request
    const response = await axios.post(endpoint, data);
    
    console.log('WhatsApp message sent:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

// Format phone number for WhatsApp
const formatPhoneNumber = (phoneNumber) => {
  // Remove any non-numeric characters
  let formattedNumber = phoneNumber.replace(/\D/g, '');
  
  // Add country code (Sri Lanka: +94) if not present
  if (!formattedNumber.startsWith('94') && formattedNumber.startsWith('0')) {
    formattedNumber = '94' + formattedNumber.substring(1);
  } else if (!formattedNumber.startsWith('94')) {
    formattedNumber = '94' + formattedNumber;
  }
  
  return formattedNumber;
};

// Template for new schedule notification
const newScheduleTemplate = (recipient, scheduleData) => {
  const date = new Date(scheduleData.date).toLocaleDateString('en-US', {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
  
  return `
🔔 *New Schedule Notification* 🔔

Dear ${recipient.name},

You have been assigned to a new schedule:

📚 *Module:* ${scheduleData.module_code}
📅 *Date:* ${date}
⏰ *Time:* ${scheduleData.start_time} - ${scheduleData.end_time}
📍 *Venue:* ${scheduleData.venue_name}
📊 *Viva Type:* ${scheduleData.viva_type}

${recipient.role === 'lecturer' || recipient.role === 'examiner' ? 
`👥 *Batch Groups:* ${recipient.batchGroups.join(', ')}
⏱️ *Time Slots:* ${recipient.timeSlots.join(', ')}` 
: ''}

${recipient.role === 'leader' ? 
`👥 *Your Group:* ${recipient.subGroup}
⏱️ *Time Slot:* ${recipient.timeSlot}` 
: ''}

Please ensure you are available during the scheduled time.

Regards,
AutoShed System
  `;
};

// Template for updated schedule notification
const updatedScheduleTemplate = (recipient, scheduleData, changes) => {
  const date = new Date(scheduleData.date).toLocaleDateString('en-US', {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
  
  return `
🔔 *Schedule Update Notification* 🔔

Dear ${recipient.name},

A schedule you are assigned to has been updated:

📚 *Module:* ${scheduleData.module_code}
📅 *Date:* ${date}
⏰ *Time:* ${scheduleData.start_time} - ${scheduleData.end_time}
📍 *Venue:* ${scheduleData.venue_name}
📊 *Viva Type:* ${scheduleData.viva_type}

${recipient.role === 'lecturer' || recipient.role === 'examiner' ? 
`👥 *Batch Groups:* ${recipient.batchGroups.join(', ')}
⏱️ *Time Slots:* ${recipient.timeSlots.join(', ')}` 
: ''}

${recipient.role === 'leader' ? 
`👥 *Your Group:* ${recipient.subGroup}
⏱️ *Time Slot:* ${recipient.timeSlot}` 
: ''}

📝 *Changes Made:*
${changes.map(change => `• ${change}`).join('\n')}

Please ensure you are available during the updated scheduled time.

Regards,
AutoShed System
  `;
};

// Template for LIC confirmation
const licConfirmationTemplate = (licName, scheduleData, recipients) => {
    const date = new Date(scheduleData.date).toLocaleDateString('en-US', {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    
    // Create detailed recipient lists with name and contact number
    const lecturerList = recipients.lecturers.map(lecturer => 
      `   • ${lecturer.name}: ${lecturer.phone_number || 'No contact number'}`
    ).join('\n');
    
    const examinerList = recipients.examiners.map(examiner => 
      `   • ${examiner.name}: ${examiner.phone_number || 'No contact number'}`
    ).join('\n');
    
    const leaderList = recipients.leaders.map(leader => 
      `   • ${leader.name}: ${leader.leader_contact_no || 'No contact number'}`
    ).join('\n');
    
    return `
  ✅ *Notification Confirmation* ✅
  
  Dear ${licName},
  
  Notifications for the following schedule have been sent successfully:
  
  📚 *Module:* ${scheduleData.module_code}
  📅 *Date:* ${date}
  ⏰ *Time:* ${scheduleData.start_time} - ${scheduleData.end_time}
  📍 *Venue:* ${scheduleData.venue_name}
  📊 *Viva Type:* ${scheduleData.viva_type}
  
  *Recipients Summary:*
  
  👩‍🏫 *Lecturers (${recipients.lecturers.length}):*
  ${lecturerList || '   • None'}
  
  🔍 *Examiners (${recipients.examiners.length}):*
  ${examinerList || '   • None'}
  
  👥 *Batch Group Leaders (${recipients.leaders.length}):*
  ${leaderList || '   • None'}
  
  Regards,
  AutoShed System
    `;
  };
  

module.exports = {
  sendWhatsAppMessage,
  newScheduleTemplate,
  updatedScheduleTemplate,
  licConfirmationTemplate
};
