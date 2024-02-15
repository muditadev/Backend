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
    creator_id INT REFERENCES users(user_id),
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Questions (
    question_id SERIAL PRIMARY KEY,
    quiz_id INT REFERENCES Quizzes(quiz_id),
    question_text TEXT NOT NULL
);


CREATE TABLE UserScores (
    user_id INT PRIMARY KEY REFERENCES users(user_id),
    quiz_id INT REFERENCES Quizzes(quiz_id),
    score INT DEFAULT 0 -- Initial score is 0
);


CREATE TABLE UserAnswers (
    answer_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    question_id INT REFERENCES Questions(question_id),
    answer_int INTEGER
);

CREATE TABLE SOS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    video VARCHAR(255),
    contact VARCHAR(255)
);


CREATE TABLE Banner (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    link VARCHAR(255),
    cover_img VARCHAR(255)
);


CREATE TABLE Blog (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    cover_img VARCHAR(255),
    description TEXT
);


CREATE TABLE Technique (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    cover_img VARCHAR(255),
    steps TEXT,
    music VARCHAR(255)
);


CREATE TABLE Social_Media (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_img VARCHAR(255),
    links VARCHAR(255)
);
