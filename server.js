const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();
app.use(express.json());
const PORT = 3000;
app.use(cors());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Anshul@2006',
    database: 'hospital_management'
});

connection.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log('Connected to MySQL database!');
});

app.get('/', (req, res) => {
    res.send('Hospital Management System API is running!');
});

app.get('/patient', (req, res) => {
    connection.query('SELECT * FROM patient', (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        res.json(results);
    });
});

app.get('/patient/:id', (req, res) => {
    const patientId = req.params.id;
    connection.query('SELECT * FROM patient WHERE p_id = ?', [patientId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        if (results.length === 0) return res.status(404).json({ error: 'Patient not found' });
        res.json(results[0]);
    });
});

app.get('/patient/search/:name', (req, res) => {
    const name = req.params.name;
    connection.query(
        'SELECT * FROM patient WHERE firstname LIKE ?',
        [`%${name}%`],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Server error' });
            res.json(results);
        }
    );
});

app.post('/patient', (req, res) => {
    const {firstname, lastname, dob, gender} = req.body;
    if(!firstname || !lastname || !dob || !gender) {
        return res.status(400).json({error: 'All fields are mandatory'});
    }
    connection.query(
        'INSERT INTO patient(firstname, lastname, dob, gender) VALUES(?,?,?,?)',
        [firstname, lastname, dob, gender],
        (err, result) => {
            if (err) return res.status(500).json({error: 'Database error'});
            res.status(201).json({message: 'Patient added', patientId: result.insertId});
        }
    );
});

app.put('/patient/:id', (req, res) => {
    const patientId = req.params.id;
    const { firstname, lastname, dob, gender } = req.body;
    if (!firstname || !lastname || !dob || !gender) {
        return res.status(400).json({ error: 'All fields are mandatory' });
    }
    connection.query(
        'UPDATE patient SET firstname=?, lastname=?, dob=?, gender=? WHERE p_id=?',
        [firstname, lastname, dob, gender, patientId],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Patient not found' });
            res.json({ message: 'Patient updated' });
        }
    );
});

app.delete('/patient/:id', (req, res) => {
    const patientId = req.params.id;
    connection.query(
        'DELETE FROM patient WHERE p_id = ?',
        [patientId],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Patient not found' });
            res.json({ message: 'Patient deleted' });
        }
    );
});

// BILL ENDPOINTS
app.get('/bill', (req, res) => {
    connection.query('SELECT * FROM bill', (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        res.json(results);
    });
});

app.get('/bill/:id', (req, res) => {
    const billId = req.params.id;
    connection.query('SELECT * FROM bill WHERE bill_id = ?', [billId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        if (results.length === 0) return res.status(404).json({ error: 'Bill not found' });
        res.json(results[0]);
    });
});

app.get('/bill/patient/:p_id', (req, res) => {
    const patientId = req.params.p_id;
    connection.query('SELECT * FROM bill WHERE p_id = ?', [patientId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        res.json(results);
    });
});

app.post('/bill', (req, res) => {
    const { p_id, total_amount, payment_statue, due } = req.body;
    if (!p_id || !total_amount || !payment_statue) {
        return res.status(400).json({ error: 'Required fields missing' });
    }
    connection.query(
        'INSERT INTO bill (p_id, total_amount, payment_statue, due) VALUES (?, ?, ?, ?)',
        [p_id, total_amount, payment_statue, due || 0.00],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.status(201).json({ message: 'Bill added', billId: result.insertId });
        }
    );
});

app.put('/bill/:id', (req, res) => {
    const billId = req.params.id;
    const { total_amount, payment_statue, due } = req.body;
    if (!total_amount || !payment_statue) {
        return res.status(400).json({ error: 'Required fields missing' });
    }
    connection.query(
        'UPDATE bill SET total_amount=?, payment_statue=?, due=? WHERE bill_id=?',
        [total_amount, payment_statue, due || 0.00, billId],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Bill not found' });
            res.json({ message: 'Bill updated' });
        }
    );
});

app.delete('/bill/:id', (req, res) => {
    const billId = req.params.id;
    connection.query(
        'DELETE FROM bill WHERE bill_id = ?',
        [billId],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Bill not found' });
            res.json({ message: 'Bill deleted' });
        }
    );
});
app.get('/room', (req, res) => {
    connection.query('SELECT * FROM room', (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        res.json(results);
    });
});

app.get('/room/:id', (req, res) => {
    const roomId = req.params.id;
    connection.query('SELECT * FROM room WHERE room_id = ?', [roomId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        if (results.length === 0) return res.status(404).json({ error: 'Room not found' });
        res.json(results[0]);
    });
});

app.post('/room', (req, res) => {
    const { roomtype } = req.body;
    if (!roomtype) {
        return res.status(400).json({ error: 'Room type is required' });
    }
    connection.query(
        'INSERT INTO room (roomtype) VALUES (?)',
        [roomtype],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.status(201).json({ message: 'Room added', roomId: result.insertId });
        }
    );
});

app.put('/room/:id', (req, res) => {
    const roomId = req.params.id;
    const { roomtype, availability_status } = req.body;
    if (!roomtype || !availability_status) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    connection.query(
        'UPDATE room SET roomtype=?, availability_status=? WHERE room_id=?',
        [roomtype, availability_status, roomId],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Room not found' });
            res.json({ message: 'Room updated' });
        }
    );
});

app.delete('/room/:id', (req, res) => {
    const roomId = req.params.id;
    connection.query(
        'DELETE FROM room WHERE room_id = ?',
        [roomId],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Room not found' });
            res.json({ message: 'Room deleted' });
        }
    );
});

app.get('/doctor', (req, res) => {
    connection.query('SELECT * FROM doctor', (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        res.json(results);
    });
});

app.get('/doctor/:id', (req, res) => {
    const doctorId = req.params.id;
    connection.query('SELECT * FROM doctor WHERE d_id = ?', [doctorId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        if (results.length === 0) return res.status(404).json({ error: 'Doctor not found' });
        res.json(results[0]);
    });
});

app.post('/doctor', (req, res) => {
    const { firstname, lastname, specialization } = req.body;
    if (!firstname || !lastname || !specialization) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    connection.query(
        'INSERT INTO doctor (firstname, lastname, specialization) VALUES (?, ?, ?)',
        [firstname, lastname, specialization],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.status(201).json({ message: 'Doctor added', doctorId: result.insertId });
        }
    );
});

app.put('/doctor/:id', (req, res) => {
    const doctorId = req.params.id;
    const { firstname, lastname, specialization } = req.body;
    if (!firstname || !lastname || !specialization) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    connection.query(
        'UPDATE doctor SET firstname=?, lastname=?, specialization=? WHERE d_id=?',
        [firstname, lastname, specialization, doctorId],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Doctor not found' });
            res.json({ message: 'Doctor updated' });
        }
    );
});

app.delete('/doctor/:id', (req, res) => {
    const doctorId = req.params.id;
    connection.query(
        'DELETE FROM doctor WHERE d_id = ?',
        [doctorId],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Doctor not found' });
            res.json({ message: 'Doctor deleted' });
        }
    );
});

app.get('/appointment', (req, res) => {
    connection.query(`
        SELECT a.*, p.firstname as patient_firstname, p.lastname as patient_lastname, 
               d.firstname as doctor_firstname, d.lastname as doctor_lastname
        FROM appointment a
        JOIN patient p ON a.p_id = p.p_id
        JOIN doctor d ON a.d_id = d.d_id
    `, (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        res.json(results);
    });
});

app.get('/appointment/:id', (req, res) => {
    const appointmentId = req.params.id;
    connection.query(`
        SELECT a.*, p.firstname as patient_firstname, p.lastname as patient_lastname, 
               d.firstname as doctor_firstname, d.lastname as doctor_lastname
        FROM appointment a
        JOIN patient p ON a.p_id = p.p_id
        JOIN doctor d ON a.d_id = d.d_id
        WHERE a.appointment_id = ?
    `, [appointmentId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        if (results.length === 0) return res.status(404).json({ error: 'Appointment not found' });
        res.json(results[0]);
    });
});

app.get('/appointment/patient/:p_id', (req, res) => {
    const patientId = req.params.p_id;
    connection.query(`
        SELECT a.*, d.firstname as doctor_firstname, d.lastname as doctor_lastname
        FROM appointment a
        JOIN doctor d ON a.d_id = d.d_id
        WHERE a.p_id = ?
    `, [patientId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        res.json(results);
    });
});

app.get('/appointment/doctor/:d_id', (req, res) => {
    const doctorId = req.params.d_id;
    connection.query(`
        SELECT a.*, p.firstname as patient_firstname, p.lastname as patient_lastname
        FROM appointment a
        JOIN patient p ON a.p_id = p.p_id
        WHERE a.d_id = ?
    `, [doctorId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        res.json(results);
    });
});

app.post('/appointment', (req, res) => {
    const { p_id, d_id, appointment_date, appointment_time, status } = req.body;
    if (!p_id || !d_id || !appointment_date || !appointment_time) {
        return res.status(400).json({ error: 'Required fields missing' });
    }
    connection.query(
        'INSERT INTO appointment (p_id, d_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?)',
        [p_id, d_id, appointment_date, appointment_time, status || 'Scheduled'],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.status(201).json({ message: 'Appointment added', appointmentId: result.insertId });
        }
    );
});

app.put('/appointment/:id', (req, res) => {
    const appointmentId = req.params.id;
    const { p_id, d_id, appointment_date, appointment_time, status } = req.body;
    if (!p_id || !d_id || !appointment_date || !appointment_time || !status) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    connection.query(
        'UPDATE appointment SET p_id=?, d_id=?, appointment_date=?, appointment_time=?, status=? WHERE appointment_id=?',
        [p_id, d_id, appointment_date, appointment_time, status, appointmentId],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Appointment not found' });
            res.json({ message: 'Appointment updated' });
        }
    );
});

app.delete('/appointment/:id', (req, res) => {
    const appointmentId = req.params.id;
    connection.query(
        'DELETE FROM appointment WHERE appointment_id = ?',
        [appointmentId],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Appointment not found' });
            res.json({ message: 'Appointment deleted' });
        }
    );
});

app.get('/admission', (req, res) => {
    connection.query(`
        SELECT a.*, p.firstname as patient_firstname, p.lastname as patient_lastname, 
               r.roomtype, r.availability_status
        FROM admission a
        JOIN patient p ON a.p_id = p.p_id
        JOIN room r ON a.room_id = r.room_id
    `, (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        res.json(results);
    });
});

app.get('/admission/:id', (req, res) => {
    const admissionId = req.params.id;
    connection.query(`
        SELECT a.*, p.firstname as patient_firstname, p.lastname as patient_lastname, 
               r.roomtype, r.availability_status
        FROM admission a
        JOIN patient p ON a.p_id = p.p_id
        JOIN room r ON a.room_id = r.room_id
        WHERE a.admission_id = ?
    `, [admissionId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        if (results.length === 0) return res.status(404).json({ error: 'Admission not found' });
        res.json(results[0]);
    });
});

app.get('/admission/patient/:p_id', (req, res) => {
    const patientId = req.params.p_id;
    connection.query(`
        SELECT a.*, r.roomtype, r.availability_status
        FROM admission a
        JOIN room r ON a.room_id = r.room_id
        WHERE a.p_id = ?
    `, [patientId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        res.json(results);
    });
});

app.post('/admission', (req, res) => {
    const { p_id, room_id, admission_date, discharge_date } = req.body;
    if (!p_id || !room_id || !admission_date || !discharge_date) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    connection.query(
        'INSERT INTO admission (p_id, room_id, admission_date, discharge_date) VALUES (?, ?, ?, ?)',
        [p_id, room_id, admission_date, discharge_date],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            connection.query(
                'UPDATE room SET availability_status="Occupied" WHERE room_id=?',
                [room_id],
                (err) => {
                    if (err) console.error('Error updating room status:', err);
                }
            );
            
            res.status(201).json({ message: 'Admission added', admissionId: result.insertId });
        }
    );
});

app.put('/admission/:id', (req, res) => {
    const admissionId = req.params.id;
    const { p_id, room_id, admission_date, discharge_date } = req.body;
    if (!p_id || !room_id || !admission_date || !discharge_date) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    connection.query(
        'SELECT room_id FROM admission WHERE admission_id = ?',
        [admissionId],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (results.length === 0) return res.status(404).json({ error: 'Admission not found' });
            
            const oldRoomId = results[0].room_id;

            connection.query(
                'UPDATE admission SET p_id=?, room_id=?, admission_date=?, discharge_date=? WHERE admission_id=?',
                [p_id, room_id, admission_date, discharge_date, admissionId],
                (err, result) => {
                    if (err) return res.status(500).json({ error: 'Database error' });
                    if (result.affectedRows === 0) return res.status(404).json({ error: 'Admission not found' });
                    if (oldRoomId != room_id) {
                        connection.query(
                            'UPDATE room SET availability_status="Available" WHERE room_id=?',
                            [oldRoomId],
                            (err) => {
                                if (err) console.error('Error updating room status:', err);
                            }
                        );
                        
                        connection.query(
                            'UPDATE room SET availability_status="Occupied" WHERE room_id=?',
                            [room_id],
                            (err) => {
                                if (err) console.error('Error updating room status:', err);
                            }
                        );
                    }
                    
                    res.json({ message: 'Admission updated' });
                }
            );
        }
    );
});

app.delete('/admission/:id', (req, res) => {
    const admissionId = req.params.id;
        connection.query(
        'SELECT room_id FROM admission WHERE admission_id = ?',
        [admissionId],
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (results.length === 0) return res.status(404).json({ error: 'Admission not found' });
            
            const roomId = results[0].room_id;
            connection.query(
                'DELETE FROM admission WHERE admission_id = ?',
                [admissionId],
                (err, result) => {
                    if (err) return res.status(500).json({ error: 'Database error' });
                    if (result.affectedRows === 0) return res.status(404).json({ error: 'Admission not found' });
                    
                    // Set room to available
                    connection.query(
                        'UPDATE room SET availability_status="Available" WHERE room_id=?',
                        [roomId],
                        (err) => {
                            if (err) console.error('Error updating room status:', err);
                        }
                    );
                    
                    res.json({ message: 'Admission deleted' });
                }
            );
        }
    );
});

app.get('/medicalrecord', (req, res) => {
    connection.query(`
        SELECT m.*, p.firstname as patient_firstname, p.lastname as patient_lastname, 
               d.firstname as doctor_firstname, d.lastname as doctor_lastname
        FROM medicalrecord m
        JOIN patient p ON m.p_id = p.p_id
        JOIN doctor d ON m.d_id = d.d_id
    `, (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        res.json(results);
    });
});

app.get('/medicalrecord/:id', (req, res) => {
    const recordId = req.params.id;
    connection.query(`
        SELECT m.*, p.firstname as patient_firstname, p.lastname as patient_lastname, 
               d.firstname as doctor_firstname, d.lastname as doctor_lastname
        FROM medicalrecord m
        JOIN patient p ON m.p_id = p.p_id
        JOIN doctor d ON m.d_id = d.d_id
        WHERE m.record_id = ?
    `, [recordId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        if (results.length === 0) return res.status(404).json({ error: 'Record not found' });
        res.json(results[0]);
    });
});

app.get('/medicalrecord/patient/:p_id', (req, res) => {
    const patientId = req.params.p_id;
    connection.query(`
        SELECT m.*, d.firstname as doctor_firstname, d.lastname as doctor_lastname
        FROM medicalrecord m
        JOIN doctor d ON m.d_id = d.d_id
        WHERE m.p_id = ?
    `, [patientId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        res.json(results);
    });
});

app.post('/medicalrecord', (req, res) => {
    const { p_id, d_id, diagnosis, prescription, date_of_visit } = req.body;
    if (!p_id || !d_id || !diagnosis || !prescription || !date_of_visit) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    connection.query(
        'INSERT INTO medicalrecord (p_id, d_id, diagnosis, prescription, date_of_visit) VALUES (?, ?, ?, ?, ?)',
        [p_id, d_id, diagnosis, prescription, date_of_visit],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.status(201).json({ message: 'Medical record added', recordId: result.insertId });
        }
    );
});

app.put('/medicalrecord/:id', (req, res) => {
    const recordId = req.params.id;
    const { p_id, d_id, diagnosis, prescription, date_of_visit } = req.body;
    if (!p_id || !d_id || !diagnosis || !prescription || !date_of_visit) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    connection.query(
        'UPDATE medicalrecord SET p_id=?, d_id=?, diagnosis=?, prescription=?, date_of_visit=? WHERE record_id=?',
        [p_id, d_id, diagnosis, prescription, date_of_visit, recordId],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Record not found' });
            res.json({ message: 'Medical record updated' });
        }
    );
});

app.delete('/medicalrecord/:id', (req, res) => {
    const recordId = req.params.id;
    connection.query(
        'DELETE FROM medicalrecord WHERE record_id = ?',
        [recordId],
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (result.affectedRows === 0) return res.status(404).json({ error: 'Record not found' });
            res.json({ message: 'Medical record deleted' });
        }
    );
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});