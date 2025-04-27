CREATE TABLE batch_group (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch VARCHAR(50) NOT NULL,
    sub_group VARCHAR(50) NOT NULL UNIQUE,
    leader_IT_number VARCHAR(10) NOT NULL UNIQUE,
    leader_name VARCHAR(100) NOT NULL UNIQUE,
    leader_email VARCHAR(100) NOT NULL UNIQUE,
    leader_contact_no VARCHAR(15) NOT NULL UNIQUE
);

INSERT INTO batch_group 
(batch, sub_group, leader_IT_number, leader_name, leader_email, leader_contact_no)
VALUES
-- WD Batches
('Y3S2.WD.IT.01.01', 'Y3S2.WD.IT-1', 'IT22591001', 'Bandara M.K.', 'it22591001@my.sliit.lk', '0779100001'),
('Y3S2.WD.IT.01.01', 'Y3S2.WD.IT-2', 'IT22591002', 'Perera A.S.', 'it22591002@my.sliit.lk', '0779100002'),
('Y3S2.WD.IT.01.01', 'Y3S2.WD.IT-3', 'IT22591003', 'Silva R.T.', 'it22591003@my.sliit.lk', '0779100003'),

('Y3S2.WD.IT.01.02', 'Y3S2.WD.IT-4', 'IT22591004', 'Jayasinghe N.D.', 'it22591004@my.sliit.lk', '0779100004'),
('Y3S2.WD.IT.01.02', 'Y3S2.WD.IT-5', 'IT22591005', 'Fernando K.M.', 'it22591005@my.sliit.lk', '0779100005'),
('Y3S2.WD.IT.01.02', 'Y3S2.WD.IT-6', 'IT22591006', 'Ranasinghe H.L.', 'it22591006@my.sliit.lk', '0779100006'),

('Y3S2.WD.IT.02.01', 'Y3S2.WD.IT-7', 'IT22591007', 'Abeysekara S.J.', 'it22591007@my.sliit.lk', '0779100007'),
('Y3S2.WD.IT.02.01', 'Y3S2.WD.IT-8', 'IT22591008', 'Wijesinghe P.D.', 'it22591008@my.sliit.lk', '0779100008'),
('Y3S2.WD.IT.02.01', 'Y3S2.WD.IT-9', 'IT22591009', 'Gunawardena V.K.', 'it22591009@my.sliit.lk', '0779100009'),

('Y3S2.WD.IT.02.02', 'Y3S2.WD.IT-10', 'IT22591010', 'Dissanayake R.P.', 'it22591010@my.sliit.lk', '0779100010'),
('Y3S2.WD.IT.02.02', 'Y3S2.WD.IT-11', 'IT22591011', 'Kumarasinghe I.T.', 'it22591011@my.sliit.lk', '0779100011'),
('Y3S2.WD.IT.02.02', 'Y3S2.WD.IT-12', 'IT22591012', 'Amarasinghe T.L.', 'it22591012@my.sliit.lk', '0779100012'),

('Y3S2.WD.IT.05.01', 'Y3S2.WD.IT-13', 'IT22591013', 'Herath M.G.', 'it22591013@my.sliit.lk', '0779100013'),
('Y3S2.WD.IT.05.01', 'Y3S2.WD.IT-14', 'IT22591014', 'Samarakoon N.S.', 'it22591014@my.sliit.lk', '0779100014'),
('Y3S2.WD.IT.05.01', 'Y3S2.WD.IT-15', 'IT22591015', 'Senanayake D.C.', 'it22591015@my.sliit.lk', '0779100015'),

('Y3S2.WD.IT.05.02', 'Y3S2.WD.IT-16', 'IT22591016', 'Ekanayake B.M.', 'it22591016@my.sliit.lk', '0779100016'),
('Y3S2.WD.IT.05.02', 'Y3S2.WD.IT-17', 'IT22591017', 'Ratnayake S.P.', 'it22591017@my.sliit.lk', '0779100017'),
('Y3S2.WD.IT.05.02', 'Y3S2.WD.IT-18', 'IT22591018', 'Gamage R.I.', 'it22591018@my.sliit.lk', '0779100018'),

-- WE Batches
('Y3S2.WE.IT.01.01', 'Y3S2.WE.IT-1', 'IT22591019', 'Thilakarathna K.D.', 'it22591019@my.sliit.lk', '0779100019'),
('Y3S2.WE.IT.01.01', 'Y3S2.WE.IT-2', 'IT22591020', 'Ellepola S.K.', 'it22591020@my.sliit.lk', '0779100020'),
('Y3S2.WE.IT.01.01', 'Y3S2.WE.IT-3', 'IT22591021', 'De Alwis R.M.', 'it22591021@my.sliit.lk', '0779100021'),

('Y3S2.WE.IT.01.02', 'Y3S2.WE.IT-4', 'IT22591022', 'Bandaranayeke E.M.', 'it22591022@my.sliit.lk', '0779100022'),
('Y3S2.WE.IT.01.02', 'Y3S2.WE.IT-5', 'IT22591023', 'Dias H.L.N.', 'it22591023@my.sliit.lk', '0779100023'),
('Y3S2.WE.IT.01.02', 'Y3S2.WE.IT-6', 'IT22591024', 'Rajapaksha U.S.', 'it22591024@my.sliit.lk', '0779100024'),

('Y3S2.WE.IT.05.01', 'Y3S2.WE.IT-7', 'IT22591025', 'Nawarathna A.J.', 'it22591025@my.sliit.lk', '0779100025'),
('Y3S2.WE.IT.05.01', 'Y3S2.WE.IT-8', 'IT22591026', 'Kodithuwakku S.P.', 'it22591026@my.sliit.lk', '0779100026'),
('Y3S2.WE.IT.05.01', 'Y3S2.WE.IT-9', 'IT22591027', 'Pathirana K.A.', 'it22591027@my.sliit.lk', '0779100027'),

('Y3S2.WE.IT.05.02', 'Y3S2.WE.IT-10', 'IT22591028', 'Wickramasinghe L.T.', 'it22591028@my.sliit.lk', '0779100028'),
('Y3S2.WE.IT.05.02', 'Y3S2.WE.IT-11', 'IT22591029', 'Kumara D.G.M.', 'it22591029@my.sliit.lk', '0779100029'),
('Y3S2.WE.IT.05.02', 'Y3S2.WE.IT-12', 'IT22591030', 'Karunaratne B.S.', 'it22591030@my.sliit.lk', '0779100030');


-- Main schedule table to store basic schedule information
CREATE TABLE viva_schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    lic_id VARCHAR(50) NOT NULL,
    slot_id INT NOT NULL,
    module_code VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    venue_name VARCHAR(100) NOT NULL,
    viva_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lic_id) REFERENCES lic(lec_id),
    FOREIGN KEY (slot_id) REFERENCES free_time_slots(id),
    FOREIGN KEY (module_code) REFERENCES modules(module_code)
);

-- Table to store batch group assignments within a schedule
CREATE TABLE schedule_batch_groups (
    group_id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    batch VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES viva_schedules(schedule_id) ON DELETE CASCADE
);

-- Table to store subgroup assignments within a batch group
CREATE TABLE schedule_sub_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    sub_group VARCHAR(50) NOT NULL,
    FOREIGN KEY (group_id) REFERENCES schedule_batch_groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (sub_group) REFERENCES batch_group(sub_group)
);

-- Table to store lecturer assignments for batch groups
CREATE TABLE schedule_lecturers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    lec_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (group_id) REFERENCES schedule_batch_groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (lec_id) REFERENCES lecturers(lec_id)
);

-- Table to store examiner assignments for batch groups
CREATE TABLE schedule_examiners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    examiner_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (group_id) REFERENCES schedule_batch_groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (examiner_id) REFERENCES examiners(examiner_id)
);



//--------------------------------------------------------

-- Table to track schedule acceptance status
CREATE TABLE schedule_acceptance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    lec_id VARCHAR(50) NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    accepted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES viva_schedules(schedule_id) ON DELETE CASCADE,
    FOREIGN KEY (lec_id) REFERENCES lecturers(lec_id),
    UNIQUE KEY unique_schedule_lecturer (schedule_id, lec_id)
);

-- Table to store reschedule requests
CREATE TABLE reschedule_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    lec_id VARCHAR(50) NOT NULL,
    comment TEXT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    admin_response TEXT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (schedule_id) REFERENCES viva_schedules(schedule_id) ON DELETE CASCADE,
    FOREIGN KEY (lec_id) REFERENCES lecturers(lec_id)
);


//---------------------------------------------------------
CREATE TABLE examiner_schedule_confirmation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    examiner_id VARCHAR(50) NOT NULL,
    status ENUM('pending', 'accepted') DEFAULT 'pending',
    accepted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES viva_schedules(schedule_id) ON DELETE CASCADE,
    FOREIGN KEY (examiner_id) REFERENCES examiners(examiner_id),
    UNIQUE KEY unique_schedule_examiner (schedule_id, examiner_id)
);

CREATE TABLE examiner_rescheduling_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    examiner_id VARCHAR(50) NOT NULL,
    comment TEXT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    admin_response TEXT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (schedule_id) REFERENCES viva_schedules(schedule_id) ON DELETE CASCADE,
    FOREIGN KEY (examiner_id) REFERENCES examiners(examiner_id)
);


















//-------------------------------------------------------
Now, here's a stored procedure to handle the insertion of form data and update the time slot status:

DELIMITER //

CREATE PROCEDURE CreateVivaSchedule(
    IN p_lic_id VARCHAR(50),
    IN p_slot_id INT,
    IN p_module_code VARCHAR(20),
    IN p_date DATE,
    IN p_start_time TIME,
    IN p_end_time TIME,
    IN p_venue_name VARCHAR(100),
    IN p_viva_type VARCHAR(50)
)
BEGIN
    DECLARE new_schedule_id INT;
    
    -- Start transaction
    START TRANSACTION;
    
    -- Insert the main schedule
    INSERT INTO viva_schedules (
        lic_id, slot_id, module_code, date, start_time, end_time, venue_name, viva_type
    ) VALUES (
        p_lic_id, p_slot_id, p_module_code, p_date, p_start_time, p_end_time, p_venue_name, p_viva_type
    );
    
    -- Get the ID of the newly created schedule
    SET new_schedule_id = LAST_INSERT_ID();
    
    -- Update the time slot status to 'booked'
    UPDATE free_time_slots 
    SET status = 'booked', allocated_to = p_lic_id
    WHERE id = p_slot_id;
    
    -- Commit the transaction
    COMMIT;
    
    -- Return the new schedule ID
    SELECT new_schedule_id AS schedule_id;
END //

DELIMITER ;



And here's a stored procedure to add batch groups and their related data:


DELIMITER //

CREATE PROCEDURE AddBatchGroup(
    IN p_schedule_id INT,
    IN p_batch VARCHAR(50),
    IN p_start_time TIME,
    IN p_end_time TIME,
    IN p_duration INT,
    IN p_sub_groups JSON,
    IN p_lecturers JSON,
    IN p_examiners JSON
)
BEGIN
    DECLARE new_group_id INT;
    DECLARE i INT DEFAULT 0;
    DECLARE sub_group_count INT;
    DECLARE lecturer_count INT;
    DECLARE examiner_count INT;
    
    -- Start transaction
    START TRANSACTION;
    
    -- Insert the batch group
    INSERT INTO schedule_batch_groups (
        schedule_id, batch, start_time, end_time, duration
    ) VALUES (
        p_schedule_id, p_batch, p_start_time, p_end_time, p_duration
    );
    
    -- Get the ID of the newly created batch group
    SET new_group_id = LAST_INSERT_ID();
    
    -- Insert sub groups
    SET sub_group_count = JSON_LENGTH(p_sub_groups);
    WHILE i < sub_group_count DO
        INSERT INTO schedule_sub_groups (group_id, sub_group)
        VALUES (new_group_id, JSON_UNQUOTE(JSON_EXTRACT(p_sub_groups, CONCAT('$[', i, ']'))));
        SET i = i + 1;
    END WHILE;
    
    -- Insert lecturers
    SET i = 0;
    SET lecturer_count = JSON_LENGTH(p_lecturers);
    WHILE i < lecturer_count DO
        INSERT INTO schedule_lecturers (group_id, lec_id)
        VALUES (new_group_id, JSON_UNQUOTE(JSON_EXTRACT(p_lecturers, CONCAT('$[', i, ']'))));
        SET i = i + 1;
    END WHILE;
    
    -- Insert examiners
    SET i = 0;
    SET examiner_count = JSON_LENGTH(p_examiners);
    WHILE i < examiner_count DO
        INSERT INTO schedule_examiners (group_id, examiner_id)
        VALUES (new_group_id, JSON_UNQUOTE(JSON_EXTRACT(p_examiners, CONCAT('$[', i, ']'))));
        SET i = i + 1;
    END WHILE;
    
    -- Commit the transaction
    COMMIT;
    
    -- Return the new group ID
    SELECT new_group_id AS group_id;
END //

DELIMITER ;





-- Run these SQL queries to create the necessary tables

-- Email History Table
CREATE TABLE email_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  sender_type VARCHAR(20) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message_content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  message_type VARCHAR(50) NOT NULL,
  schedule_id INT,
  FOREIGN KEY (schedule_id) REFERENCES viva_schedules(schedule_id) ON DELETE SET NULL
);

-- WhatsApp History Table
CREATE TABLE whatsapp_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  sender_type VARCHAR(20) NOT NULL,
  recipient_phone VARCHAR(20) NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  message_content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  message_type VARCHAR(50) NOT NULL,
  schedule_id INT,
  FOREIGN KEY (schedule_id) REFERENCES viva_schedules(schedule_id) ON DELETE SET NULL
);
