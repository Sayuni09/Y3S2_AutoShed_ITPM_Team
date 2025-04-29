DELIMITER //
CREATE TRIGGER prevent_time_overlap 
BEFORE INSERT ON free_time_slots
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1 FROM free_time_slots 
        WHERE date = NEW.date
        AND venue_id = NEW.venue_id
        AND (
            (NEW.start_time >= start_time AND NEW.start_time < end_time) OR
            (NEW.end_time > start_time AND NEW.end_time <= end_time) OR
            (NEW.start_time <= start_time AND NEW.end_time >= end_time)
        )
    ) THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Time slot overlaps with an existing one!';
    END IF;
END;
//
DELIMITER ;





CREATE TABLE lecturers (
    lec_id VARCHAR(50) PRIMARY KEY, -- Change to VARCHAR to allow both strings and numbers
    lec_name VARCHAR(100) NOT NULL, -- Name of the lecturer
    lec_email VARCHAR(100) UNIQUE NOT NULL, -- Unique email for each lecturer
    phone_number VARCHAR(20), -- Phone number of the lecturer
    password VARCHAR(255) NOT NULL, -- Hashed password for authentication
    lecture_modules JSON, -- Stores array of module codes assigned to the lecturer
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp of when the record was created
);



CREATE TABLE lic (
    lec_id VARCHAR(50) PRIMARY KEY, -- Unique identifier for each lecturer in charge
    lec_name VARCHAR(100) NOT NULL, -- Name of the lecturer in charge
    lec_email VARCHAR(100) UNIQUE NOT NULL, -- Unique email for each lecturer in charge
    phone_number VARCHAR(20), -- Phone number of the lecturer in charge
    password VARCHAR(255) NOT NULL, -- Hashed password for authentication
    lic_modules JSON, -- Stores array of module codes where the lecturer is in charge
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp of when the record was created
);


CREATE TABLE examiners (
    examiner_id VARCHAR(50) PRIMARY KEY, -- Unique identifier for each examiner
    examiner_name VARCHAR(100) NOT NULL, -- Name of the examiner
    examiner_email VARCHAR(100) UNIQUE NOT NULL, -- Unique email for each examiner
    phone_number VARCHAR(20), -- Phone number of the examiner
    password VARCHAR(255) NOT NULL, -- Hashed password for authentication
    module_codes JSON, -- Stores array of module codes assigned to the examiner
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp of when the record was created
);






//---------\
CREATE TABLE lecturers (
    lec_id VARCHAR(50) PRIMARY KEY, 
    lec_name VARCHAR(100) NOT NULL, 
    lec_email VARCHAR(100) UNIQUE NOT NULL, 
    phone_number VARCHAR(20), 
    password VARCHAR(255) NOT NULL, 
    lecture_modules JSON, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);


CREATE TABLE examiners (
    examiner_id VARCHAR(50) PRIMARY KEY, 
    examiner_name VARCHAR(100) NOT NULL, 
    examiner_email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20), 
    password VARCHAR(255) NOT NULL, 
    module_codes JSON, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);


CREATE TABLE lic (
    lec_id VARCHAR(50) PRIMARY KEY,
    lec_name VARCHAR(100) NOT NULL, 
    lec_email VARCHAR(100) UNIQUE NOT NULL, 
    phone_number VARCHAR(20), 
    password VARCHAR(255) NOT NULL, 
    lic_modules JSON, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);



CREATE TABLE lic (
    lec_id VARCHAR(50) PRIMARY KEY,
    lec_name VARCHAR(100) NOT NULL, 
    lec_email VARCHAR(100) UNIQUE NOT NULL, 
    phone_number VARCHAR(20), 
    password VARCHAR(255) NOT NULL, 
    lic_modules JSON, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE lecturers (
    lec_id VARCHAR(50) PRIMARY KEY, 
    lec_name VARCHAR(100) NOT NULL, 
    lec_email VARCHAR(100) UNIQUE NOT NULL, 
    phone_number VARCHAR(20), 
    password VARCHAR(255) NOT NULL, 
    lecture_modules JSON, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE lecturer_availability_forms (
    form_id INT AUTO_INCREMENT PRIMARY KEY,
    lec_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comments TEXT,
    FOREIGN KEY (lec_id) REFERENCES lecturers(lec_id) ON DELETE CASCADE
);


CREATE TABLE lecturer_availability_slots (
    slot_id INT AUTO_INCREMENT PRIMARY KEY,
    form_id INT,
    available_date DATE NOT NULL,
    morning_slot BOOLEAN DEFAULT FALSE,
    mid_day_slot BOOLEAN DEFAULT FALSE,
    afternoon_slot BOOLEAN DEFAULT FALSE,
    max_sessions_per_day INT DEFAULT 2,
    FOREIGN KEY (form_id) REFERENCES lecturer_availability_forms(form_id) ON DELETE CASCADE
);

//--------------------------------------



//------------------------------------

CREATE TABLE examiners (
    examiner_id VARCHAR(50) PRIMARY KEY, 
    examiner_name VARCHAR(100) NOT NULL, 
    examiner_email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20), 
    password VARCHAR(255) NOT NULL, 
    module_codes JSON, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);


CREATE TABLE examiners_availability_forms (
    form_id INT AUTO_INCREMENT PRIMARY KEY,
    examiner_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comments TEXT,
    FOREIGN KEY (examiner_id) REFERENCES examiners(examiner_id) ON DELETE CASCADE
);

CREATE TABLE examiners_availability_slots (
    slot_id INT AUTO_INCREMENT PRIMARY KEY,
    form_id INT,
    available_date DATE NOT NULL,
    morning_slot BOOLEAN DEFAULT FALSE,
    mid_day_slot BOOLEAN DEFAULT FALSE,
    afternoon_slot BOOLEAN DEFAULT FALSE,
    max_sessions_per_day INT DEFAULT 2,
    FOREIGN KEY (form_id) REFERENCES examiners_availability_forms(form_id) ON DELETE CASCADE
);


//-----------------------modules and free_time_slots


CREATE TABLE free_time_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_code VARCHAR(20) NOT NULL,
    academic_year varchar(1) NOT NULL,
    semester ENUM('Semester 1', 'Semester 2') NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    venue_name VARCHAR(12) NOT NULL,
    allocated_to VARCHAR(50) NULL, -- lic_id
    status ENUM('available', 'booked') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (module_code) REFERENCES modules(module_code),
    FOREIGN KEY (allocated_to) REFERENCES lic(lec_id) 
);


CREATE TABLE modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_code VARCHAR(10) NOT NULL UNIQUE,
    module_name VARCHAR(100) NOT NULL
);

INSERT INTO modules (module_code, module_name) VALUES
('IT1040', 'Database Systems'),
('IT4010', 'Software Engineering'),
('IT4020', 'Machine Learning'),
('IT3050', 'Computer Networks'),
('IT2020', 'Operating Systems'),
('IT6789', 'Artificial Intelligence'),
('IT5544', 'Cyber Security');


INSERT INTO free_time_slots (
    module_code, academic_year, semester, week_start_date, week_end_date, date, 
    start_time, end_time, venue_name, allocated_to, status
) VALUES
('IT4040', '1', 'Semester 1', '2025-04-01', '2025-04-07', '2025-04-03', '10:00:00', '12:00:00', 'G-13.05', 'lic07', 'available'),
('IT4040', '4', 'Semester 2', '2025-05-01', '2025-05-07', '2025-05-04', '14:00:00', '16:00:00', 'A-503', 'lic07', 'booked'),
('IT6789', '4', 'Semester 1', '2025-06-01', '2025-06-07', '2025-06-05', '08:30:00', '10:30:00', 'B-3.02', 'lic07', 'available'),
('IT4020', '3', 'Semester 2', '2025-07-01', '2025-07-07', '2025-07-06', '13:00:00', '15:00:00', 'F-11.01', 'lic07', 'booked'),
('IT5544', '2', 'Semester 1', '2025-08-01', '2025-08-07', '2025-08-02', '09:00:00', '11:00:00', 'G-3.03', 'lic07', 'available');


//----------------------------------------



INSERT INTO free_time_slots (
    module_code, academic_year, semester, week_start_date, week_end_date, date, 
    start_time, end_time, venue_name, allocated_to, status
) VALUES
('IT4040', '1', 'Semester 1', '2024-04-28', '2024-04-04', '2025-04-01', '10:00:00', '12:00:00', 'G-13.05', 'lic01', 'available'),
('IT4040', '4', 'Semester 2', '2024-04-28', '2024-05-04', '2025-05-03', '14:00:00', '16:00:00', 'A-503', 'lic01', 'available');
