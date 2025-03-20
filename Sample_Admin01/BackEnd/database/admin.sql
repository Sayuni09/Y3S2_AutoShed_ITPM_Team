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


