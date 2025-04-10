USE hospital_management;
CREATE TABLE patient(
	p_id INT auto_increment PRIMARY KEY,
	firstname VARCHAR(30),
	lastname VARCHAR(30),
	dob DATE,
	gender VARCHAR(10),
	registration_date DATETIME DEFAULT current_timestamp
) ;
CREATE TABLE bill(
	bill_id INT,
    p_id INT,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_statue VARCHAR(50) NOT NULL,
    due DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    PRIMARY KEY(bill_id, p_id),
    FOREIGN KEY(p_id) references patient(p_id)
);
CREATE TABLE room (
    room_id INT PRIMARY KEY AUTO_INCREMENT,
    roomtype VARCHAR(50),
    availability_status ENUM('Available', 'Occupied') DEFAULT 'Available'
);
CREATE TABLE admission (
    admission_id INT PRIMARY KEY AUTO_INCREMENT,
    p_id INT NOT NULL,
    room_id INT NOT NULL,
    admission_date DATE NOT NULL,
    discharge_date DATE NOT NULL,
    FOREIGN KEY (p_id) REFERENCES Patient(p_id),
    FOREIGN KEY (room_id) REFERENCES Room(room_id)
);
CREATE TABLE doctor (
    d_id INT PRIMARY KEY AUTO_INCREMENT,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    specialization VARCHAR(100) NOT NULL
);
CREATE TABLE appointment (
    appointment_id INT PRIMARY KEY AUTO_INCREMENT,
    p_id INT NOT NULL,
    d_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled' NOT NULL,
    FOREIGN KEY (p_id) REFERENCES Patient(p_id),
    FOREIGN KEY (d_id) REFERENCES Doctor(d_id)
);
CREATE TABLE MedicalRecord (
    record_id INT PRIMARY KEY AUTO_INCREMENT,
    p_id INT NOT NULL,
    d_id INT NOT NULL,
    diagnosis TEXT NOT NULL,
    prescription TEXT NOT NULL,
    date_of_visit DATE NOT NULL,
    FOREIGN KEY (p_id) REFERENCES Patient(p_id),
    FOREIGN KEY (d_id) REFERENCES Doctor(d_id)
);
