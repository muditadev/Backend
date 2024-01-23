-- users table 
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    mobile VARCHAR(15),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    role VARCHAR(10) CHECK (role IN ('mentor', 'mentee','admin')),
    address VARCHAR(255),
    created_at DATE DEFAULT CURRENT_DATE
);

-- Mentors Table
CREATE TABLE mentors (
    mentor_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE,
    experience VARCHAR(255),
    degree VARCHAR(255),
    medical_lic_num VARCHAR(255),
    pancard_img VARCHAR(255),
    adharcard_front_img VARCHAR(255),
    adharcard_back_img VARCHAR(255),
    doctor_reg_cert_img VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Mentees Table
CREATE TABLE mentees (
    mentee_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE,
    dob DATE,
    occupation VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);