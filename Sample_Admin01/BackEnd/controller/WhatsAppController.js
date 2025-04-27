const db = require("../models/db");
const whatsappService = require("../utils/whatsappService");

// Get leader details from a batch group's sub groups
const getBatchGroupLeaders = async (subGroups) => {
  try {
    const leaders = [];
    
    for (const subGroup of subGroups) {
      const query = `
        SELECT leader_name, leader_email, sub_group, leader_IT_number, leader_contact_no
        FROM batch_group
        WHERE sub_group = ?
      `;
      
      const [result] = await db.promise().query(query, [subGroup]);
      
      if (result.length > 0) {
        leaders.push(result[0]);
      }
    }
    
    return leaders;
  } catch (error) {
    console.error("Error fetching batch group leaders:", error);
    return [];
  }
};

// Get lecturer details
const getLecturerDetails = async (lecturerIds) => {
  try {
    if (!lecturerIds || lecturerIds.length === 0) return [];
    
    const query = `
      SELECT lec_id, lec_name, lec_email, phone_number
      FROM lecturers
      WHERE lec_id IN (?)
    `;
    
    const [results] = await db.promise().query(query, [lecturerIds]);
    return results;
  } catch (error) {
    console.error("Error fetching lecturer details:", error);
    return [];
  }
};

// Get examiner details
const getExaminerDetails = async (examinerIds) => {
  try {
    if (!examinerIds || examinerIds.length === 0) return [];
    
    const query = `
      SELECT examiner_id, examiner_name, examiner_email, phone_number
      FROM examiners
      WHERE examiner_id IN (?)
    `;
    
    const [results] = await db.promise().query(query, [examinerIds]);
    return results;
  } catch (error) {
    console.error("Error fetching examiner details:", error);
    return [];
  }
};

// Get LIC details
const getLicDetails = async (licId) => {
  try {
    const query = `
      SELECT lec_id, lec_name, lec_email, phone_number
      FROM lic
      WHERE lec_id = ?
    `;
    
    const [results] = await db.promise().query(query, [licId]);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error("Error fetching LIC details:", error);
    return null;
  }
};

// Send WhatsApp notifications for a schedule
const sendScheduleWhatsAppNotifications = async (scheduleId, isUpdate = false, changes = []) => {
  try {
    // Get full schedule details with all relations
    const scheduleDetails = await getFullScheduleDetails(scheduleId);
    if (!scheduleDetails) {
      console.error("Schedule not found or error fetching schedule details");
      return { success: false, error: "Schedule not found" };
    }

    // Prepare recipients
    const recipients = {
      lecturers: [],
      examiners: [],
      leaders: []
    };

    // Process each batch group
    for (const group of scheduleDetails.batchGroups) {
      // Get lecturer details
      const lecturerIds = group.lecturers.map(lec => typeof lec === 'object' ? lec.lec_id : lec);
      const lecturers = await getLecturerDetails(lecturerIds);
      
      // Get examiner details
      const examinerIds = group.examiners.map(ex => typeof ex === 'object' ? ex.examiner_id : ex);
      const examiners = await getExaminerDetails(examinerIds);
      
      // Get batch group leaders
      const leaders = await getBatchGroupLeaders(group.subGroups);
      
      // Add to recipients with their batch group info
      lecturers.forEach(lecturer => {
        // Check if lecturer already exists in recipients
        const existingLecturer = recipients.lecturers.find(l => l.lec_id === lecturer.lec_id);
        
        if (existingLecturer) {
          // Add this batch group info to existing lecturer
          existingLecturer.batchGroups.push(group.batch);
          existingLecturer.timeSlots.push(`${group.start_time} - ${group.end_time}`);
        } else {
          // Add as new lecturer
          recipients.lecturers.push({
            ...lecturer,
            role: 'lecturer',
            name: lecturer.lec_name,
            batchGroups: [group.batch],
            timeSlots: [`${group.start_time} - ${group.end_time}`]
          });
        }
      });
      
      examiners.forEach(examiner => {
        // Check if examiner already exists in recipients
        const existingExaminer = recipients.examiners.find(e => e.examiner_id === examiner.examiner_id);
        
        if (existingExaminer) {
          // Add this batch group info to existing examiner
          existingExaminer.batchGroups.push(group.batch);
          existingExaminer.timeSlots.push(`${group.start_time} - ${group.end_time}`);
        } else {
          // Add as new examiner
          recipients.examiners.push({
            ...examiner,
            role: 'examiner',
            name: examiner.examiner_name,
            batchGroups: [group.batch],
            timeSlots: [`${group.start_time} - ${group.end_time}`]
          });
        }
      });
      
      leaders.forEach(leader => {
        recipients.leaders.push({
          ...leader,
          role: 'leader',
          name: leader.leader_name,
          subGroup: leader.sub_group,
          timeSlot: `${group.start_time} - ${group.end_time}`
        });
      });
    }

    // Get LIC details
    const lic = await getLicDetails(scheduleDetails.lic_id);
    
   
// For lecturers
for (const lecturer of recipients.lecturers) {
  if (lecturer.phone_number) {
    const messageTemplate = isUpdate 
      ? whatsappService.updatedScheduleTemplate(lecturer, scheduleDetails, changes)
      : whatsappService.newScheduleTemplate(lecturer, scheduleDetails);
    
    const result = await whatsappService.sendWhatsAppMessage(lecturer.phone_number, messageTemplate);
    
    // Log WhatsApp message to database
    await logWhatsAppToDB(
      scheduleDetails.lic_id, 
      'lic', 
      lecturer.phone_number, 
      lecturer.lec_name, 
      messageTemplate, 
      result.idMessage ? 'success' : 'failed',
      isUpdate ? 'schedule_update' : 'new_schedule',
      scheduleId
    );
  }
}

// For examiners
for (const examiner of recipients.examiners) {
  if (examiner.phone_number) {
    const messageTemplate = isUpdate 
      ? whatsappService.updatedScheduleTemplate(examiner, scheduleDetails, changes)
      : whatsappService.newScheduleTemplate(examiner, scheduleDetails);
    
    const result = await whatsappService.sendWhatsAppMessage(examiner.phone_number, messageTemplate);
    
    // Log WhatsApp message to database
    await logWhatsAppToDB(
      scheduleDetails.lic_id, 
      'lic', 
      examiner.phone_number, 
      examiner.examiner_name, 
      messageTemplate, 
      result.idMessage ? 'success' : 'failed',
      isUpdate ? 'schedule_update' : 'new_schedule',
      scheduleId
    );
  }
}

// For batch group leaders
for (const leader of recipients.leaders) {
  if (leader.leader_contact_no) {
    const messageTemplate = isUpdate 
      ? whatsappService.updatedScheduleTemplate(leader, scheduleDetails, changes)
      : whatsappService.newScheduleTemplate(leader, scheduleDetails);
    
    const result = await whatsappService.sendWhatsAppMessage(leader.leader_contact_no, messageTemplate);
    
    // Log WhatsApp message to database
    await logWhatsAppToDB(
      scheduleDetails.lic_id, 
      'lic', 
      leader.leader_contact_no, 
      leader.leader_name, 
      messageTemplate, 
      result.idMessage ? 'success' : 'failed',
      isUpdate ? 'schedule_update' : 'new_schedule',
      scheduleId
    );
  }
}
    
    // Send confirmation WhatsApp message to LIC
    if (lic && lic.phone_number) {
      const recipientSummary = {
        lecturers: recipients.lecturers,
        examiners: recipients.examiners,
        leaders: recipients.leaders
      };
      
      const licTemplate = whatsappService.licConfirmationTemplate(
        lic.lec_name, 
        scheduleDetails, 
        recipientSummary
      );
      
      await whatsappService.sendWhatsAppMessage(lic.phone_number, licTemplate);
    }
    
    return { 
      success: true, 
      stats: {
        lecturers: recipients.lecturers.length,
        examiners: recipients.examiners.length,
        leaders: recipients.leaders.length
      }
    };
  } catch (error) {
    console.error("Error sending schedule WhatsApp notifications:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to get full schedule details
const getFullScheduleDetails = async (scheduleId) => {
  try {
    // Get main schedule info
    const scheduleQuery = `
      SELECT 
        schedule_id, lic_id, slot_id, module_code, 
        DATE_FORMAT(date, '%Y-%m-%d') as date, 
        start_time, end_time, venue_name, viva_type,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
      FROM viva_schedules 
      WHERE schedule_id = ?
    `;

    const [scheduleResults] = await db.promise().query(scheduleQuery, [scheduleId]);
    if (scheduleResults.length === 0) {
      return null;
    }

    const schedule = scheduleResults[0];

    // Get batch groups with all related data
    const batchGroupsQuery = `
      SELECT group_id, batch, start_time, end_time, duration
      FROM schedule_batch_groups
      WHERE schedule_id = ?
    `;

    const [batchGroupResults] = await db.promise().query(batchGroupsQuery, [scheduleId]);
    const batchGroups = [];

    // Process each batch group to get its related data
    for (const group of batchGroupResults) {
      const group_id = group.group_id;
      const batchGroupData = {
        ...group,
        subGroups: [],
        lecturers: [],
        examiners: []
      };

      // Get sub groups
      const subGroupsQuery = `
        SELECT sg.sub_group
        FROM schedule_sub_groups sg
        WHERE sg.group_id = ?
      `;
      
      const [subGroupResults] = await db.promise().query(subGroupsQuery, [group_id]);
      batchGroupData.subGroups = subGroupResults.map(sg => sg.sub_group);

      // Get lecturers
      const lecturersQuery = `
        SELECT sl.lec_id, l.lec_name
        FROM schedule_lecturers sl
        JOIN lecturers l ON sl.lec_id = l.lec_id
        WHERE sl.group_id = ?
      `;
      
      const [lecturerResults] = await db.promise().query(lecturersQuery, [group_id]);
      batchGroupData.lecturers = lecturerResults;

      // Get examiners
      const examinersQuery = `
        SELECT se.examiner_id, e.examiner_name
        FROM schedule_examiners se
        JOIN examiners e ON se.examiner_id = e.examiner_id
        WHERE se.group_id = ?
      `;
      
      const [examinerResults] = await db.promise().query(examinersQuery, [group_id]);
      batchGroupData.examiners = examinerResults;

      batchGroups.push(batchGroupData);
    }

    return {
      ...schedule,
      batchGroups
    };
  } catch (error) {
    console.error("Error fetching schedule details:", error);
    return null;
  }
};


// Add to WhatsAppController.js after existing functions
// This logs each sent WhatsApp message to the database

const logWhatsAppToDB = async (sender_id, sender_type, recipient_phone, recipient_name, message_content, status, message_type, schedule_id) => {
  const query = `
    INSERT INTO whatsapp_history 
    (sender_id, sender_type, recipient_phone, recipient_name, message_content, status, message_type, schedule_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await db.promise().query(
      query, 
      [sender_id, sender_type, recipient_phone, recipient_name, message_content, status, message_type, schedule_id]
    );
  } catch (error) {
    console.error("Error logging WhatsApp message to database:", error);
  }
};


module.exports = {
  sendScheduleWhatsAppNotifications
};
