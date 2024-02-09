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


-- Quizze Section

CREATE TABLE Quizzes (
    quiz_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    creator_id INT REFERENCES Users(user_id),
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- other relevant columns
);

CREATE TABLE Questions (
    question_id SERIAL PRIMARY KEY,
    quiz_id INT REFERENCES Quizzes(quiz_id),
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL,
    -- other relevant columns
);

CREATE TABLE Options (
    option_id SERIAL PRIMARY KEY,
    question_id INT REFERENCES Questions(question_id),
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    -- other relevant columns
);

CREATE TABLE Answers (
    answer_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    question_id INT REFERENCES Questions(question_id),
    selected_option_id INT REFERENCES Options(option_id),
    answer_text TEXT, -- for fill-in-the-blank questions
    is_correct BOOLEAN NOT NULL,
    submission_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- other relevant columns
);
