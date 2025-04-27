const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure email transporter using environment variables
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // 'gmail', 'SendGrid', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use app password for Gmail or API key for SendGrid
  }
});

// Function to generate calendar links for different calendar platforms
const generateCalendarLinks = (scheduleData) => {
  // Create event title and details
  const eventTitle = `${scheduleData.viva_type} - ${scheduleData.module_code}`;
  const eventDescription = `${scheduleData.module_code} ${scheduleData.viva_type}`;
  const eventLocation = scheduleData.venue_name;
  
  // Parse start and end times
  const startDate = new Date(scheduleData.date);
  const [startHours, startMinutes] = scheduleData.start_time.split(':').map(Number);
  startDate.setHours(startHours, startMinutes, 0);
  
  const endDate = new Date(scheduleData.date);
  const [endHours, endMinutes] = scheduleData.end_time.split(':').map(Number);
  endDate.setHours(endHours, endMinutes, 0);
  
  // Format dates for calendar URLs (YYYYMMDDTHHMMSSZ format)
  const startFormatted = startDate.toISOString().replace(/-|:|\.\d+/g, '');
  const endFormatted = endDate.toISOString().replace(/-|:|\.\d+/g, '');
  
  // Create calendar URLs
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startFormatted}/${endFormatted}&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(eventLocation)}&sf=true&output=xml`;
  
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(eventTitle)}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(eventLocation)}`;
  
  const yahooUrl = `https://calendar.yahoo.com/?v=60&title=${encodeURIComponent(eventTitle)}&st=${startFormatted}&et=${endFormatted}&desc=${encodeURIComponent(eventDescription)}&in_loc=${encodeURIComponent(eventLocation)}`;
  
  // Generate ICS content for Apple Calendar and Outlook desktop
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:${eventTitle}
DTSTART:${startFormatted}
DTEND:${endFormatted}
LOCATION:${eventLocation}
DESCRIPTION:${eventDescription}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
  
  return {
    google: googleUrl,
    outlook: outlookUrl,
    yahoo: yahooUrl,
    ics: `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`,
    icsFilename: `${scheduleData.module_code}_${scheduleData.viva_type.replace(/\s+/g, '_')}.ics`
  };
};

// Create calendar buttons HTML for email templates
const getCalendarButtonsHtml = (links, buttonColor, buttonText) => {
  return `
    <div style="text-align: center; margin: 30px 0;">
      <div style="margin-bottom: 15px;">
        <a href="${links.google}" target="_blank" style="background-color: ${buttonColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500; display: inline-block;">
          <span style="display: inline-block; vertical-align: middle;">📅</span> ${buttonText}
        </a>
      </div>
      <div style="display: inline-block; font-size: 13px; color: #666; margin-top: 10px;">
        Add to: 
        <a href="${links.google}" target="_blank" style="color: #4285F4; text-decoration: underline; margin: 0 5px;">Google</a> | 
        <a href="${links.outlook}" target="_blank" style="color: #0078D4; text-decoration: underline; margin: 0 5px;">Outlook</a> | 
        <a href="${links.yahoo}" target="_blank" style="color: #6001D2; text-decoration: underline; margin: 0 5px;">Yahoo</a> | 
        <a href="${links.ics}" download="${links.icsFilename}" style="color: #555555; text-decoration: underline; margin: 0 5px;">Apple/Others (.ics)</a>
      </div>
    </div>
  `;
};

// Utility function to send emails
const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

// Template for new schedule notification
const newScheduleTemplate = (recipient, scheduleData) => {
  const date = new Date(scheduleData.date).toLocaleDateString('en-US', {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });
  
  // Generate calendar links
  const calendarLinks = generateCalendarLinks(scheduleData);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Schedule Notification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Schedule Notification</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 20px 30px;">
          <p style="font-size: 16px; color: #333; line-height: 1.5;">Dear <strong>${recipient.name}</strong>,</p>
          <p style="font-size: 16px; color: #333; line-height: 1.5;">You have been assigned to a new schedule:</p>
          
          <!-- Schedule Card -->
          <div style="background-color: #f5f7ff; border-left: 4px solid #3f51b5; border-radius: 6px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: bold; color: #3f51b5; display: inline-block; width: 100px;">Module:</span>
                  <span style="color: #333;">${scheduleData.module_code}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: bold; color: #3f51b5; display: inline-block; width: 100px;">Date:</span>
                  <span style="color: #333;">${date}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: bold; color: #3f51b5; display: inline-block; width: 100px;">Time:</span>
                  <span style="color: #333;">${scheduleData.start_time} - ${scheduleData.end_time}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: bold; color: #3f51b5; display: inline-block; width: 100px;">Venue:</span>
                  <span style="color: #333;">${scheduleData.venue_name}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: bold; color: #3f51b5; display: inline-block; width: 100px;">Viva Type:</span>
                  <span style="color: #333;">${scheduleData.viva_type}</span>
                </td>
              </tr>
              
              ${recipient.role === 'lecturer' || recipient.role === 'examiner' ? 
              `<tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: bold; color: #3f51b5; display: inline-block; width: 100px;">Batch Groups:</span>
                  <span style="color: #333;">${recipient.batchGroups.join(', ')}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: bold; color: #3f51b5; display: inline-block; width: 100px;">Time Slots:</span>
                  <span style="color: #333;">${recipient.timeSlots.join(', ')}</span>
                </td>
              </tr>` 
              : ''}
              
              ${recipient.role === 'leader' ? 
              `<tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: bold; color: #3f51b5; display: inline-block; width: 100px;">Your Group:</span>
                  <span style="color: #333;">${recipient.subGroup}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: bold; color: #3f51b5; display: inline-block; width: 100px;">Time Slot:</span>
                  <span style="color: #333;">${recipient.timeSlot}</span>
                </td>
              </tr>` 
              : ''}
            </table>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.5; margin-bottom: 5px;">Please ensure you are available during the scheduled time.</p>
          
          <!-- Calendar buttons -->
          ${getCalendarButtonsHtml(calendarLinks, '#3f51b5', 'Add to Calendar')}
          
          <p style="font-size: 16px; color: #666; margin-top: 30px;">Regards,<br>AutoShed System</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>© ${new Date().getFullYear()} AutoShed System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
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
  
  // Generate calendar links
  const calendarLinks = generateCalendarLinks(scheduleData);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Schedule Update Notification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Schedule Update Notification</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 20px 30px;">
          <p style="font-size: 16px; color: #333; line-height: 1.5;">Dear <strong>${recipient.name}</strong>,</p>
          <p style="font-size: 16px; color: #333; line-height: 1.5;">A schedule you are assigned to has been updated:</p>
          
          <!-- Schedule Card -->
          <div style="background-color: #fef9f0; border-left: 4px solid #ff9800; border-radius: 6px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: bold; color: #e65100; display: inline-block; width: 100px;">Module:</span>
                  <span style="color: #333;">${scheduleData.module_code}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: bold; color: #e65100; display: inline-block; width: 100px;">Date:</span>
                  <span style="color: #333;">${date}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: bold; color: #e65100; display: inline-block; width: 100px;">Time:</span>
                  <span style="color: #333;">${scheduleData.start_time} - ${scheduleData.end_time}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: bold; color: #e65100; display: inline-block; width: 100px;">Venue:</span>
                  <span style="color: #333;">${scheduleData.venue_name}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: bold; color: #e65100; display: inline-block; width: 100px;">Viva Type:</span>
                  <span style="color: #333;">${scheduleData.viva_type}</span>
                </td>
              </tr>
              
              ${recipient.role === 'lecturer' || recipient.role === 'examiner' ? 
              `<tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: bold; color: #e65100; display: inline-block; width: 100px;">Batch Groups:</span>
                  <span style="color: #333;">${recipient.batchGroups.join(', ')}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: bold; color: #e65100; display: inline-block; width: 100px;">Time Slots:</span>
                  <span style="color: #333;">${recipient.timeSlots.join(', ')}</span>
                </td>
              </tr>` 
              : ''}
              
              ${recipient.role === 'leader' ? 
              `<tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: bold; color: #e65100; display: inline-block; width: 100px;">Your Group:</span>
                  <span style="color: #333;">${recipient.subGroup}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: bold; color: #e65100; display: inline-block; width: 100px;">Time Slot:</span>
                  <span style="color: #333;">${recipient.timeSlot}</span>
                </td>
              </tr>` 
              : ''}
            </table>
          </div>
          
          <!-- Changes Section with animated arrows -->
          <div style="background-color: #fff8e1; border-radius: 6px; padding: 20px; margin: 20px 0; border-left: 4px solid #ff9800;">
            <h3 style="color: #e65100; margin-top: 0; display: flex; align-items: center;">
              <span style="margin-right: 10px;">📝</span> Changes Made:
            </h3>
            <ul style="padding-left: 15px; margin: 15px 0;">
              ${changes.map(change => `
                <li style="padding: 8px 0; color: #d84315; font-weight: 500; position: relative;">
                  ${change}
                </li>`).join('')}
            </ul>
          </div>
          
          <p style="font-size: 16px; color: #333; line-height: 1.5; margin-bottom: 5px;">Please ensure you are available during the updated scheduled time.</p>
          
          <!-- Calendar buttons -->
          ${getCalendarButtonsHtml(calendarLinks, '#ff9800', 'Update Calendar')}
          
          <p style="font-size: 16px; color: #666; margin-top: 30px;">Regards,<br>AutoShed System</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>© ${new Date().getFullYear()} AutoShed System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
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
  
  // Generate calendar links
  const calendarLinks = generateCalendarLinks(scheduleData);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Schedule Notification Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4caf50 0%, #81c784 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Notification Confirmation</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 20px 30px;">
          <p style="font-size: 16px; color: #333; line-height: 1.5;">Dear <strong>${licName}</strong>,</p>
          <p style="font-size: 16px; color: #333; line-height: 1.5;">Notifications for the following schedule have been sent successfully:</p>
          
          <!-- Schedule Card -->
          <div style="background-color: #f1f8e9; border-left: 4px solid #4caf50; border-radius: 6px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: bold; color: #2e7d32; display: inline-block; width: 100px;">Module:</span>
                  <span style="color: #333;">${scheduleData.module_code}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: bold; color: #2e7d32; display: inline-block; width: 100px;">Date:</span>
                  <span style="color: #333;">${date}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: bold; color: #2e7d32; display: inline-block; width: 100px;">Time:</span>
                  <span style="color: #333;">${scheduleData.start_time} - ${scheduleData.end_time}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: bold; color: #2e7d32; display: inline-block; width: 100px;">Venue:</span>
                  <span style="color: #333;">${scheduleData.venue_name}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                  <span style="font-weight: bold; color: #2e7d32; display: inline-block; width: 100px;">Viva Type:</span>
                  <span style="color: #333;">${scheduleData.viva_type}</span>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Recipients Accordion-style sections -->
          <div style="border-radius: 6px; margin: 20px 0; overflow: hidden; border: 1px solid #e0e0e0;">
            <!-- Lecturers Section -->
            <div style="border-bottom: 1px solid #e0e0e0;">
              <div style="background-color: #e8f5e9; padding: 15px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; color: #2e7d32; font-size: 16px;">
                  <span style="margin-right: 10px;">👨‍🏫</span> Lecturers (${recipients.lecturers.length})
                </h3>
                <span style="color: #2e7d32; font-weight: bold;">▼</span>
              </div>
              <div style="padding: 15px; background-color: #f9f9f9;">
                <ul style="margin: 0; padding-left: 20px; list-style-type: none;">
                  ${recipients.lecturers.map(lecturer => `
                    <li style="padding: 8px 0; border-bottom: 1px dashed #e0e0e0; display: flex; align-items: center;">
                      <span style="background-color: #4caf50; color: white; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px;">
                        ${lecturer.name.charAt(0)}
                      </span>
                      <span style="flex-grow: 1;">${lecturer.name}</span>
                      <span style="color: #757575; font-size: 14px;">${lecturer.email}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
            
            <!-- Examiners Section -->
            <div style="border-bottom: 1px solid #e0e0e0;">
              <div style="background-color: #e8f5e9; padding: 15px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; color: #2e7d32; font-size: 16px;">
                  <span style="margin-right: 10px;">🔍</span> Examiners (${recipients.examiners.length})
                </h3>
                <span style="color: #2e7d32; font-weight: bold;">▼</span>
              </div>
              <div style="padding: 15px; background-color: #f9f9f9;">
                <ul style="margin: 0; padding-left: 20px; list-style-type: none;">
                  ${recipients.examiners.map(examiner => `
                    <li style="padding: 8px 0; border-bottom: 1px dashed #e0e0e0; display: flex; align-items: center;">
                      <span style="background-color: #4caf50; color: white; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px;">
                        ${examiner.name.charAt(0)}
                      </span>
                      <span style="flex-grow: 1;">${examiner.name}</span>
                      <span style="color: #757575; font-size: 14px;">${examiner.email}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
            
            <!-- Batch Group Leaders Section -->
            <div>
              <div style="background-color: #e8f5e9; padding: 15px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; color: #2e7d32; font-size: 16px;">
                  <span style="margin-right: 10px;">👥</span> Batch Group Leaders (${recipients.leaders.length})
                </h3>
                <span style="color: #2e7d32; font-weight: bold;">▼</span>
              </div>
              <div style="padding: 15px; background-color: #f9f9f9;">
                <ul style="margin: 0; padding-left: 20px; list-style-type: none;">
                  ${recipients.leaders.map(leader => `
                    <li style="padding: 8px 0; border-bottom: 1px dashed #e0e0e0; display: flex; align-items: center;">
                      <span style="background-color: #4caf50; color: white; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px;">
                        ${leader.name.charAt(0)}
                      </span>
                      <span style="flex-grow: 1;">${leader.name} - <strong>${leader.subGroup}</strong></span>
                      <span style="color: #757575; font-size: 14px;">${leader.email}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            </div>
          </div>
          
          <!-- Calendar buttons -->
          ${getCalendarButtonsHtml(calendarLinks, '#4caf50', 'View Schedule Details')}
          
          <p style="font-size: 16px; color: #666; margin-top: 30px;">Regards,<br>AutoShed System</p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>© ${new Date().getFullYear()} AutoShed System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendEmail,
  newScheduleTemplate,
  updatedScheduleTemplate,
  licConfirmationTemplate
};

