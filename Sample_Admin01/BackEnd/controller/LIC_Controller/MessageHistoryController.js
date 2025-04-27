// D:\React_Nodejs\git repostry\Sayu_Git_Autoshed\AutoShed_Sayu_Thila\Sample_Admin01\BackEnd\controller\LIC_Controller\MessageHistoryController.js

const db = require("../../models/db");

// Get email history for a specific LIC
exports.getLicEmailHistory = (req, res) => {
  const { lic_id } = req.params;

  const query = `
    SELECT 
      e.id,
      e.recipient_email,
      e.recipient_name,
      e.subject,
      e.message_content,
      e.status,
      e.sent_at,
      e.message_type,
      vs.module_code,
      vs.viva_type
    FROM email_history e
    LEFT JOIN viva_schedules vs ON e.schedule_id = vs.schedule_id
    WHERE e.sender_id = ? AND e.sender_type = 'lic'
    ORDER BY e.sent_at DESC
    LIMIT 50
  `;

  db.query(query, [lic_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error occurred" });
    }

    res.json(results);
  });
};

// Get WhatsApp message history for a specific LIC
exports.getLicWhatsAppHistory = (req, res) => {
  const { lic_id } = req.params;

  const query = `
    SELECT 
      w.id,
      w.recipient_phone,
      w.recipient_name,
      w.message_content,
      w.status,
      w.sent_at,
      w.message_type,
      vs.module_code,
      vs.viva_type
    FROM whatsapp_history w
    LEFT JOIN viva_schedules vs ON w.schedule_id = vs.schedule_id
    WHERE w.sender_id = ? AND w.sender_type = 'lic'
    ORDER BY w.sent_at DESC
    LIMIT 50
  `;

  db.query(query, [lic_id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error occurred" });
    }

    res.json(results);
  });
};
