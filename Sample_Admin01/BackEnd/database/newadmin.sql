


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


//----------------------------------------


-- Main table for schedules
CREATE TABLE schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    lic_id VARCHAR(50) NOT NULL,
    slot_id INT NOT NULL,
    module_code VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    venue_name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    viva_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lic_id) REFERENCES lic(lec_id),
    FOREIGN KEY (slot_id) REFERENCES free_time_slots(id),
    FOREIGN KEY (module_code) REFERENCES modules(module_code)
);

-- Table for batch groups
CREATE TABLE schedule_batch_groups (
    group_id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    schedule_batch VARCHAR(50) NOT NULL,
    duration INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_batch) REFERENCES batch_group (batch) 
);

-- Table for sub-groups
CREATE TABLE schedule_sub_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    schedule_sub_group VARCHAR(50) NOT NULL,
    FOREIGN KEY (group_id) REFERENCES schedule_batch_groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_sub_group) REFERENCES batch_group (sub_group) 
);

-- Table for assigned lecturers
CREATE TABLE schedule_lecturers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    lecturer_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (group_id) REFERENCES schedule_batch_groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (lecturer_id) REFERENCES lecturers(lec_id)
);

-- Table for assigned examiners
CREATE TABLE schedule_examiners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    examiner_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (group_id) REFERENCES schedule_batch_groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (examiner_id) REFERENCES examiners(examiner_id)
);