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
    console.log('GET / HIT')
    res.send('Hospital Management System API is running!');
});
app.get('/patient', (req, res) => {
    connection.query('SELECT * FROM patient', (err, results) => {
        if (err) {
            console.error('Error fetching patients:', err);
            return res.status(500).json({ error:'Server error'});
        }
        res.json(results);
    });
});
app.get('/patient/:id', (req, res) => {
    const patientId = req.params.id;
    connection.query('SELECT * FROM patient WHERE p_id = ?', [patientId], (err, results) => {
        if (err) {
            console.error('Error fetching patient:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.json(results[0]);
    });
});
app.get('/patient/search/:name', (req, res) => {
    const name = req.params.name;
    connection.query(
        'SELECT * FROM patient WHERE firstname LIKE ?',
        [`%${name}%`],
        (err, results) => {
            if (err) {
                console.error('Error fetching patient:', err);
                return res.status(500).json({ error: 'Server error' });
            }
            res.json(results);
        }
    );
});
// app.get('/patient/search', (req, res) => {
//     const name = req.params.search;
//     connection.query(
//         'SELECT * FROM patient WHERE firstname LIKE ?',
//         [`%${name}%`],
//         (err, results) => {
//             if (err) {
//                 console.error('Error fetching patient:', err);
//                 return res.status(500).json({ error: 'Server error' });
//             }
//             res.json(results);
//         }
//     );
// });
// app.get('/patient/:name', (req, res) => {
//     const name = req.params.name;
//     connection.query(
//         'SELECT * FROM patient WHERE firstname LIKE ?',
//         [`%${name}%`],
//         (err, results) => {
//             if (err) {
//                 console.error('Error fetching patient:', err);
//                 return res.status(500).json({ error: 'Server error' });
//             }
//             res.json(results);
//         }
//     );
// });
app.post('/patient', (req, res) => {
    const {firstname, lastname, dob, gender} = req.body;
    if(!firstname || !lastname || !dob || !gender){
        return res.status(400).json({error: 'All fields are mandatory!!'});
    }
    const sql = 'INSERT INTO patient(firstname, lastname, dob, gender) VALUES(?,?,?,?)';
    connection.query(sql, [firstname, lastname, dob, gender], (err,result) =>{
        if(err){
            console.error('Error Adding Patient : ', err);
            return res.status(500).json({error: 'Database error'});
        }
        res.status(201).json({message: 'Patient added Successfully!!', patientId: result.insertId});
    });
});
app.put('/patient/:id', (req, res) => {
    const patientId = req.params.id;
    const { firstname, lastname, dob, gender } = req.body;
    if (!firstname || !lastname || !dob || !gender) {
        return res.status(400).json({ error: 'All fields are mandatory!!' });
    }
    connection.query(
        'UPDATE patient SET firstname=?, lastname=?, dob=?, gender=? WHERE p_id=?',
        [firstname, lastname, dob, gender, patientId],
        (err, result) => {
            if (err) {
                console.error('Error updating patient:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Patient not found' });
            }
            res.json({ message: 'Patient updated successfully' });
        }
    );
});
app.delete('/patient/:id', (req, res) => {
    const patientId = req.params.id;
    connection.query(
        'DELETE FROM patient WHERE p_id = ?',
        [patientId],
        (err, result) => {
            if (err) {
                console.error('Error deleting patient:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Patient not found' });
            }
            res.json({ message: 'Patient deleted successfully' });
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