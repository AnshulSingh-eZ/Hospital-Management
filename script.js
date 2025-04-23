// Global variables
let currentTab = 'patient-tab';
let patients = [];
let doctors = [];
let rooms = [];
let appointments = [];
let admissions = [];
let medicalRecords = [];
let bills = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load initial data
    loadPatients();
    loadDoctors();
    loadRooms();
    loadAppointments();
    loadAdmissions();
    loadMedicalRecords();
    loadBills();
    
    // Set up form event listeners
    setupFormListeners();
});

// Tab management
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
    currentTab = tabId;
}

// Message display
function showMessage(message, type) {
    const msgDiv = document.getElementById('msg');
    msgDiv.innerText = message;
    msgDiv.className = type;
    setTimeout(() => msgDiv.innerText = '', 5000);
}

// Form setup
function setupFormListeners() {
    // Patient form
    document.getElementById('patient-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handlePatientSubmit();
    });
    
    // Doctor form
    document.getElementById('doctor-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleDoctorSubmit();
    });
    
    // Room form
    document.getElementById('room-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleRoomSubmit();
    });
    
    // Appointment form
    document.getElementById('appointment-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleAppointmentSubmit();
    });
    
    // Admission form
    document.getElementById('admission-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleAdmissionSubmit();
    });
    
    // Medical Record form
    document.getElementById('medical-record-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleMedicalRecordSubmit();
    });
    
    // Bill form
    document.getElementById('bill-form').addEventListener('submit', function(e) {
        e.preventDefault();
        handleBillSubmit();
    });
}

// ============ PATIENT FUNCTIONS ============
function loadPatients() {
    fetch('http://localhost:3000/patient')
        .then(response => response.json())
        .then(data => {
            patients = data;
            renderPatientTable(patients);
            updatePatientDropdowns();
        })
        .catch(error => {
            console.error('Error loading patients:', error);
            showMessage('Error loading patients', 'error');
        });
}

function searchPatients() {
    const searchTerm = document.getElementById('patient-search').value.toLowerCase();
    if (!searchTerm) {
        renderPatientTable(patients);
        return;
    }
    
    const filtered = patients.filter(patient => 
        patient.firstname.toLowerCase().includes(searchTerm) ||
        patient.lastname.toLowerCase().includes(searchTerm) ||
        patient.p_id.toString().includes(searchTerm)
    );
    
    renderPatientTable(filtered);
}

function resetPatientSearch() {
    document.getElementById('patient-search').value = '';
    renderPatientTable(patients);
}

function renderPatientTable(patientList) {
    const tbody = document.querySelector('#patient-table tbody');
    tbody.innerHTML = '';
    
    patientList.forEach(patient => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${patient.p_id}</td>
            <td>${patient.firstname} ${patient.lastname}</td>
            <td>${patient.dob}</td>
            <td>${patient.gender}</td>
            <td>
                <button onclick="editPatient(${patient.p_id})">Edit</button>
                <button class="danger" onclick="deletePatient(${patient.p_id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editPatient(patientId) {
    const patient = patients.find(p => p.p_id == patientId);
    if (!patient) return;
    
    document.getElementById('patient-id').value = patient.p_id;
    document.getElementById('patient-firstname').value = patient.firstname;
    document.getElementById('patient-lastname').value = patient.lastname;
    document.getElementById('patient-dob').value = patient.dob;
    document.getElementById('patient-gender').value = patient.gender;
    
    document.getElementById('patient-form-title').textContent = 'Edit Patient';
    document.getElementById('patient-submit').textContent = 'Update Patient';
    document.getElementById('patient-cancel').style.display = 'inline-block';
    
    document.getElementById('patient-form').scrollIntoView({ behavior: 'smooth' });
}

function resetPatientForm() {
    document.getElementById('patient-form').reset();
    document.getElementById('patient-form-title').textContent = 'Add New Patient';
    document.getElementById('patient-submit').textContent = 'Add Patient';
    document.getElementById('patient-cancel').style.display = 'none';
}

function handlePatientSubmit() {
    const patientId = document.getElementById('patient-id').value;
    const data = {
        firstname: document.getElementById('patient-firstname').value,
        lastname: document.getElementById('patient-lastname').value,
        dob: document.getElementById('patient-dob').value,
        gender: document.getElementById('patient-gender').value
    };
    
    if (!data.firstname || !data.lastname || !data.dob || !data.gender) {
        showMessage('All fields are required', 'error');
        return;
    }
    
    const url = patientId ? `http://localhost:3000/patient/${patientId}` : 'http://localhost:3000/patient';
    const method = patientId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showMessage(result.error, 'error');
        } else {
            showMessage(patientId ? 'Patient updated successfully' : 'Patient added successfully', 'success');
            resetPatientForm();
            loadPatients();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('An error occurred', 'error');
    });
}

function deletePatient(patientId) {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    
    fetch(`http://localhost:3000/patient/${patientId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showMessage(result.error, 'error');
        } else {
            showMessage('Patient deleted successfully', 'success');
            loadPatients();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('An error occurred', 'error');
    });
}

function updatePatientDropdowns() {
    const dropdowns = [
        'appointment-patient',
        'admission-patient',
        'medical-record-patient',
        'bill-patient'
    ];
    
    dropdowns.forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            dropdown.innerHTML = '';
            patients.forEach(patient => {
                const option = document.createElement('option');
                option.value = patient.p_id;
                option.textContent = `${patient.firstname} ${patient.lastname}`;
                dropdown.appendChild(option);
            });
        }
    });
}

// ============ DOCTOR FUNCTIONS ============
function loadDoctors() {
    fetch('http://localhost:3000/doctor')
        .then(response => response.json())
        .then(data => {
            doctors = data;
            renderDoctorTable(doctors);
            updateDoctorDropdowns();
        })
        .catch(error => {
            console.error('Error loading doctors:', error);
            showMessage('Error loading doctors', 'error');
        });
}

function searchDoctors() {
    const searchTerm = document.getElementById('doctor-search').value.toLowerCase();
    if (!searchTerm) {
        renderDoctorTable(doctors);
        return;
    }
    
    const filtered = doctors.filter(doctor => 
        doctor.firstname.toLowerCase().includes(searchTerm) ||
        doctor.lastname.toLowerCase().includes(searchTerm) ||
        doctor.specialization.toLowerCase().includes(searchTerm) ||
        doctor.d_id.toString().includes(searchTerm)
    );
    
    renderDoctorTable(filtered);
}

function resetDoctorSearch() {
    document.getElementById('doctor-search').value = '';
    renderDoctorTable(doctors);
}

function renderDoctorTable(doctorList) {
    const tbody = document.querySelector('#doctor-table tbody');
    tbody.innerHTML = '';
    
    doctorList.forEach(doctor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${doctor.d_id}</td>
            <td>${doctor.firstname} ${doctor.lastname}</td>
            <td>${doctor.specialization}</td>
            <td>
                <button onclick="editDoctor(${doctor.d_id})">Edit</button>
                <button class="danger" onclick="deleteDoctor(${doctor.d_id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editDoctor(doctorId) {
    const doctor = doctors.find(d => d.d_id == doctorId);
    if (!doctor) return;
    
    document.getElementById('doctor-id').value = doctor.d_id;
    document.getElementById('doctor-firstname').value = doctor.firstname;
    document.getElementById('doctor-lastname').value = doctor.lastname;
    document.getElementById('doctor-specialization').value = doctor.specialization;
    
    document.getElementById('doctor-form-title').textContent = 'Edit Doctor';
    document.getElementById('doctor-submit').textContent = 'Update Doctor';
    document.getElementById('doctor-cancel').style.display = 'inline-block';
    
    document.getElementById('doctor-form').scrollIntoView({ behavior: 'smooth' });
}

function resetDoctorForm() {
    document.getElementById('doctor-form').reset();
    document.getElementById('doctor-form-title').textContent = 'Add New Doctor';
    document.getElementById('doctor-submit').textContent = 'Add Doctor';
    document.getElementById('doctor-cancel').style.display = 'none';
}

function handleDoctorSubmit() {
    const doctorId = document.getElementById('doctor-id').value;
    const data = {
        firstname: document.getElementById('doctor-firstname').value,
        lastname: document.getElementById('doctor-lastname').value,
        specialization: document.getElementById('doctor-specialization').value
    };
    
    if (!data.firstname || !data.lastname || !data.specialization) {
        showMessage('All fields are required', 'error');
        return;
    }
    
    const url = doctorId ? `http://localhost:3000/doctor/${doctorId}` : 'http://localhost:3000/doctor';
    const method = doctorId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showMessage(result.error, 'error');
        } else {
            showMessage(doctorId ? 'Doctor updated successfully' : 'Doctor added successfully', 'success');
            resetDoctorForm();
            loadDoctors();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('An error occurred', 'error');
    });
}

function deleteDoctor(doctorId) {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    
    fetch(`http://localhost:3000/doctor/${doctorId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showMessage(result.error, 'error');
        } else {
            showMessage('Doctor deleted successfully', 'success');
            loadDoctors();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('An error occurred', 'error');
    });
}

function updateDoctorDropdowns() {
    const dropdowns = [
        'appointment-doctor',
        'medical-record-doctor'
    ];
    
    dropdowns.forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            dropdown.innerHTML = '';
            doctors.forEach(doctor => {
                const option = document.createElement('option');
                option.value = doctor.d_id;
                option.textContent = `${doctor.firstname} ${doctor.lastname} (${doctor.specialization})`;
                dropdown.appendChild(option);
            });
        }
    });
}

// ============ ROOM FUNCTIONS ============
function loadRooms() {
    fetch('http://localhost:3000/room')
        .then(response => response.json())
        .then(data => {
            rooms = data;
            renderRoomTable(rooms);
            updateRoomDropdown();
        })
        .catch(error => {
            console.error('Error loading rooms:', error);
            showMessage('Error loading rooms', 'error');
        });
}

function searchRooms() {
    const searchTerm = document.getElementById('room-search').value.toLowerCase();
    if (!searchTerm) {
        renderRoomTable(rooms);
        return;
    }
    
    const filtered = rooms.filter(room => 
        room.roomtype.toLowerCase().includes(searchTerm) ||
        room.availability_status.toLowerCase().includes(searchTerm) ||
        room.room_id.toString().includes(searchTerm)
    );
    
    renderRoomTable(filtered);
}

function resetRoomSearch() {
    document.getElementById('room-search').value = '';
    renderRoomTable(rooms);
}

function renderRoomTable(roomList) {
    const tbody = document.querySelector('#room-table tbody');
    tbody.innerHTML = '';
    
    roomList.forEach(room => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${room.room_id}</td>
            <td>${room.roomtype}</td>
            <td>${room.availability_status}</td>
            <td>
                <button onclick="editRoom(${room.room_id})">Edit</button>
                <button class="danger" onclick="deleteRoom(${room.room_id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editRoom(roomId) {
    const room = rooms.find(r => r.room_id == roomId);
    if (!room) return;
    
    document.getElementById('room-id').value = room.room_id;
    document.getElementById('room-type').value = room.roomtype;
    document.getElementById('room-status').value = room.availability_status;
    
    document.getElementById('room-form-title').textContent = 'Edit Room';
    document.getElementById('room-submit').textContent = 'Update Room';
    document.getElementById('room-cancel').style.display = 'inline-block';
    
    document.getElementById('room-form').scrollIntoView({ behavior: 'smooth' });
}

function resetRoomForm() {
    document.getElementById('room-form').reset();
    document.getElementById('room-form-title').textContent = 'Add New Room';
    document.getElementById('room-submit').textContent = 'Add Room';
    document.getElementById('room-cancel').style.display = 'none';
}

function handleRoomSubmit() {
    const roomId = document.getElementById('room-id').value;
    const data = {
        roomtype: document.getElementById('room-type').value,
        availability_status: document.getElementById('room-status').value
    };
    
    if (!data.roomtype || !data.availability_status) {
        showMessage('All fields are required', 'error');
        return;
    }
    
    const url = roomId ? `http://localhost:3000/room/${roomId}` : 'http://localhost:3000/room';
    const method = roomId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showMessage(result.error, 'error');
        } else {
            showMessage(roomId ? 'Room updated successfully' : 'Room added successfully', 'success');
            resetRoomForm();
            loadRooms();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('An error occurred', 'error');
    });
}

function deleteRoom(roomId) {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    fetch(`http://localhost:3000/room/${roomId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showMessage(result.error, 'error');
        } else {
            showMessage('Room deleted successfully', 'success');
            loadRooms();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('An error occurred', 'error');
    });
}

function updateRoomDropdown() {
    const dropdown = document.getElementById('admission-room');
    if (dropdown) {
        dropdown.innerHTML = '';
        rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.room_id;
            option.textContent = `${room.roomtype} (${room.availability_status})`;
            dropdown.appendChild(option);
        });
    }
}

// ============ APPOINTMENT FUNCTIONS ============
function loadAppointments() {
    fetch('http://localhost:3000/appointment')
        .then(response => response.json())
        .then(data => {
            appointments = data;
            renderAppointmentTable(appointments);
        })
        .catch(error => {
            console.error('Error loading appointments:', error);
            showMessage('Error loading appointments', 'error');
        });
}

function searchAppointments() {
    const searchTerm = document.getElementById('appointment-search').value.toLowerCase();
    if (!searchTerm) {
        renderAppointmentTable(appointments);
        return;
    }

    const filtered = appointments.filter(appointment =>
        `${appointment.patient_firstname} ${appointment.patient_lastname}`.toLowerCase().includes(searchTerm) ||
        `${appointment.doctor_firstname} ${appointment.doctor_lastname}`.toLowerCase().includes(searchTerm) ||
        appointment.appointment_id.toString().includes(searchTerm)
    );

    renderAppointmentTable(filtered);
}

function resetAppointmentSearch() {
    document.getElementById('appointment-search').value = '';
    renderAppointmentTable(appointments);
}

function renderAppointmentTable(appointmentList) {
    const tbody = document.querySelector('#appointment-table tbody');
    tbody.innerHTML = '';

    appointmentList.forEach(appointment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appointment.appointment_id}</td>
            <td>${appointment.patient_firstname} ${appointment.patient_lastname}</td>
            <td>${appointment.doctor_firstname} ${appointment.doctor_lastname}</td>
            <td>${appointment.appointment_date}</td>
            <td>${appointment.appointment_time}</td>
            <td>${appointment.status}</td>
            <td>
                <button onclick="editAppointment(${appointment.appointment_id})">Edit</button>
                <button class="danger" onclick="deleteAppointment(${appointment.appointment_id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editAppointment(appointmentId) {
    const appointment = appointments.find(a => a.appointment_id == appointmentId);
    if (!appointment) return;

    document.getElementById('appointment-id').value = appointment.appointment_id;
    document.getElementById('appointment-patient').value = appointment.p_id;
    document.getElementById('appointment-doctor').value = appointment.d_id;
    document.getElementById('appointment-date').value = appointment.appointment_date;
    document.getElementById('appointment-time').value = appointment.appointment_time;
    document.getElementById('appointment-status').value = appointment.status;

    document.getElementById('appointment-form-title').textContent = 'Edit Appointment';
    document.getElementById('appointment-submit').textContent = 'Update Appointment';
    document.getElementById('appointment-cancel').style.display = 'inline-block';

    document.getElementById('appointment-form').scrollIntoView({ behavior: 'smooth' });
}

function resetAppointmentForm() {
    document.getElementById('appointment-form').reset();
    document.getElementById('appointment-form-title').textContent = 'Schedule Appointment';
    document.getElementById('appointment-submit').textContent = 'Schedule';
    document.getElementById('appointment-cancel').style.display = 'none';
}

function handleAppointmentSubmit() {
    const appointmentId = document.getElementById('appointment-id').value;
    const data = {
        p_id: document.getElementById('appointment-patient').value,
        d_id: document.getElementById('appointment-doctor').value,
        appointment_date: document.getElementById('appointment-date').value,
        appointment_time: document.getElementById('appointment-time').value,
        status: document.getElementById('appointment-status').value
    };

    if (!data.p_id || !data.d_id || !data.appointment_date || !data.appointment_time || !data.status) {
        showMessage('All fields are required', 'error');
        return;
    }

    const url = appointmentId ? `http://localhost:3000/appointment/${appointmentId}` : 'http://localhost:3000/appointment';
    const method = appointmentId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showMessage(result.error, 'error');
        } else {
            showMessage(appointmentId ? 'Appointment updated successfully' : 'Appointment added successfully', 'success');
            resetAppointmentForm();
            loadAppointments();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('An error occurred', 'error');
    });
}

function deleteAppointment(appointmentId) {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    fetch(`http://localhost:3000/appointment/${appointmentId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showMessage(result.error, 'error');
        } else {
            showMessage('Appointment deleted successfully', 'success');
            loadAppointments();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('An error occurred', 'error');
    });
}

// ============ ADMISSION FUNCTIONS ============
function loadAdmissions() {
    fetch('http://localhost:3000/admission')
        .then(response => response.json())
        .then(data => {
            admissions = data;
            renderAdmissionTable(admissions);
        })
        .catch(error => {
            console.error('Error loading admissions:', error);
            showMessage('Error loading admissions', 'error');
        });
}

function searchAdmissions() {
    const searchTerm = document.getElementById('admission-search').value.toLowerCase();
    if (!searchTerm) {
        renderAdmissionTable(admissions);
        return;
    }

    const filtered = admissions.filter(admission =>
        `${admission.patient_firstname} ${admission.patient_lastname}`.toLowerCase().includes(searchTerm) ||
        admission.roomtype.toLowerCase().includes(searchTerm) ||
        admission.admission_id.toString().includes(searchTerm)
    );

    renderAdmissionTable(filtered);
}

function resetAdmissionSearch() {
    document.getElementById('admission-search').value = '';
    renderAdmissionTable(admissions);
}

function renderAdmissionTable(admissionList) {
    const tbody = document.querySelector('#admission-table tbody');
    tbody.innerHTML = '';

    admissionList.forEach(admission => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${admission.admission_id}</td>
            <td>${admission.patient_firstname} ${admission.patient_lastname}</td>
            <td>${admission.roomtype}</td>
            <td>${admission.admission_date}</td>
            <td>${admission.discharge_date}</td>
            <td>
                <button onclick="editAdmission(${admission.admission_id})">Edit</button>
                <button class="danger" onclick="deleteAdmission(${admission.admission_id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editAdmission(admissionId) {
    const admission = admissions.find(a => a.admission_id == admissionId);
    if (!admission) return;

    document.getElementById('admission-id').value = admission.admission_id;
    document.getElementById('admission-patient').value = admission.p_id;
    document.getElementById('admission-room').value = admission.room_id;
    document.getElementById('admission-date').value = admission.admission_date;
    document.getElementById('discharge-date').value = admission.discharge_date;

    document.getElementById('admission-form-title').textContent = 'Edit Admission';
    document.getElementById('admission-submit').textContent = 'Update Admission';
    document.getElementById('admission-cancel').style.display = 'inline-block';

    document.getElementById('admission-form').scrollIntoView({ behavior: 'smooth' });
}

function resetAdmissionForm() {
    document.getElementById('admission-form').reset();
    document.getElementById('admission-form-title').textContent = 'New Admission';
    document.getElementById('admission-submit').textContent = 'Admit Patient';
    document.getElementById('admission-cancel').style.display = 'none';
}

function handleAdmissionSubmit() {
    const admissionId = document.getElementById('admission-id').value;
    const data = {
        p_id: document.getElementById('admission-patient').value,
        room_id: document.getElementById('admission-room').value,
        admission_date: document.getElementById('admission-date').value,
        discharge_date: document.getElementById('discharge-date').value
    };

    if (!data.p_id || !data.room_id || !data.admission_date || !data.discharge_date) {
        showMessage('All fields are required', 'error');
        return;
    }

    const url = admissionId ? `http://localhost:3000/admission/${admissionId}` : 'http://localhost:3000/admission';
    const method = admissionId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showMessage(result.error, 'error');
        } else {
            showMessage(admissionId ? 'Admission updated successfully' : 'Admission added successfully', 'success');
            resetAdmissionForm();
            loadAdmissions();
            loadRooms(); // Update room statuses
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('An error occurred', 'error');
    });
}

function deleteAdmission(admissionId) {
    if (!confirm('Are you sure you want to delete this admission?')) return;

    fetch(`http://localhost:3000/admission/${admissionId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showMessage(result.error, 'error');
        } else {
            showMessage('Admission deleted successfully', 'success');
            loadAdmissions();
            loadRooms(); // Update room statuses
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('An error occurred', 'error');
    });
}

// ============ MEDICAL RECORD FUNCTIONS ============
function loadMedicalRecords() {
    fetch('http://localhost:3000/medicalrecord')
        .then(response => response.json())
        .then(data => {
            medicalRecords = data;
            renderMedicalRecordTable(medicalRecords);
        })
        .catch(error => {
            console.error('Error loading medical records:', error);
            showMessage('Error loading medical records', 'error');
        });
}

function searchMedicalRecords() {
    const searchTerm = document.getElementById('record-search').value.toLowerCase();
    if (!searchTerm) {
        renderMedicalRecordTable(medicalRecords);
        return;
    }

    const filtered = medicalRecords.filter(record =>
        `${record.patient_firstname} ${record.patient_lastname}`.toLowerCase().includes(searchTerm) ||
        `${record.doctor_firstname} ${record.doctor_lastname}`.toLowerCase().includes(searchTerm) ||
        record.record_id.toString().includes(searchTerm)
    );

    renderMedicalRecordTable(filtered);
}

function resetMedicalRecordSearch() {
    document.getElementById('record-search').value = '';
    renderMedicalRecordTable(medicalRecords);
}

function renderMedicalRecordTable(recordList) {
    const tbody = document.querySelector('#medical-record-table tbody');
    tbody.innerHTML = '';

    recordList.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.record_id}</td>
            <td>${record.patient_firstname} ${record.patient_lastname}</td>
            <td>${record.doctor_firstname} ${record.doctor_lastname}</td>
            <td>${record.date_of_visit}</td>
            <td>${record.diagnosis}</td>
            <td>
                <button onclick="editMedicalRecord(${record.record_id})">Edit</button>
                <button class="danger" onclick="deleteMedicalRecord(${record.record_id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editMedicalRecord(recordId) {
    const record = medicalRecords.find(r => r.record_id == recordId);
    if (!record) return;

    document.getElementById('medical-record-id').value = record.record_id;
    document.getElementById('medical-record-patient').value = record.p_id;
    document.getElementById('medical-record-doctor').value = record.d_id;
    document.getElementById('medical-record-date').value = record.date_of_visit;
    document.getElementById('medical-record-diagnosis').value = record.diagnosis;
    document.getElementById('medical-record-prescription').value = record.prescription;

    document.getElementById('medical-record-form-title').textContent = 'Edit Medical Record';
    document.getElementById('medical-record-submit').textContent = 'Update Record';
    document.getElementById('medical-record-cancel').style.display = 'inline-block';

    document.getElementById('medical-record-form').scrollIntoView({ behavior: 'smooth' });
}

function resetMedicalRecordForm() {
    document.getElementById('medical-record-form').reset();
    document.getElementById('medical-record-form-title').textContent = 'New Medical Record';
    document.getElementById('medical-record-submit').textContent = 'Add Record';
    document.getElementById('medical-record-cancel').style.display = 'none';
}

function handleMedicalRecordSubmit() {
    const recordId = document.getElementById('medical-record-id').value;
    const data = {
        p_id: document.getElementById('medical-record-patient').value,
        d_id: document.getElementById('medical-record-doctor').value,
        date_of_visit: document.getElementById('medical-record-date').value,
        diagnosis: document.getElementById('medical-record-diagnosis').value,
        prescription: document.getElementById('medical-record-prescription').value
    };

    if (!data.p_id || !data.d_id || !data.date_of_visit || !data.diagnosis || !data.prescription) {
        showMessage('All fields are required', 'error');
        return;
    }

    const url = recordId ? `http://localhost:3000/medicalrecord/${recordId}` : 'http://localhost:3000/medicalrecord';
    const method = recordId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showMessage(result.error, 'error');
        } else {
            showMessage(recordId ? 'Medical record updated successfully' : 'Medical record added successfully', 'success');
            resetMedicalRecordForm();
            loadMedicalRecords();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('An error occurred', 'error');
    });
}

function deleteMedicalRecord(recordId) {
    if (!confirm('Are you sure you want to delete this medical record?')) return;

    fetch(`http://localhost:3000/medicalrecord/${recordId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showMessage(result.error, 'error');
        } else {
            showMessage('Medical record deleted successfully', 'success');
            loadMedicalRecords();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('An error occurred', 'error');
    });
}

// ============ BILL FUNCTIONS ============
function loadBills() {
    fetch('http://localhost:3000/bill')
        .then(response => response.json())
        .then(data => {
            bills = data;
            renderBillTable(bills);
        })
        .catch(error => {
            console.error('Error loading bills:', error);
            showMessage('Error loading bills', 'error');
        });
}

function searchBills() {
    const searchTerm = document.getElementById('bill-search').value.toLowerCase();
    if (!searchTerm) {
        renderBillTable(bills);
        return;
    }

    // Note: Backend doesn't return patient names, so we join with patients array
    const filtered = bills.filter(bill => {
        const patient = patients.find(p => p.p_id == bill.p_id);
        if (!patient) return false;
        return (
            `${patient.firstname} ${patient.lastname}`.toLowerCase().includes(searchTerm) ||
            bill.bill_id.toString().includes(searchTerm)
        );
    });

    renderBillTable(filtered);
}

function resetBillSearch() {
    document.getElementById('bill-search').value = '';
    renderBillTable(bills);
}

function renderBillTable(billList) {
    const tbody = document.querySelector('#bill-table tbody');
    tbody.innerHTML = '';

    billList.forEach(bill => {
        const patient = patients.find(p => p.p_id == bill.p_id);
        const patientName = patient ? `${patient.firstname} ${patient.lastname}` : 'Unknown';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${bill.bill_id}</td>
            <td>${patientName}</td>
            <td>${bill.total_amount}</td>
            <td>${bill.payment_statue}</td>
            <td>${bill.due}</td>
            <td>
                <button onclick="editBill(${bill.bill_id})">Edit</button>
                <button class="danger" onclick="deleteBill(${bill.bill_id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editBill(billId) {
    const bill = bills.find(b => b.bill_id == billId);
    if (!bill) return;

    document.getElementById('bill-id').value = bill.bill_id;
    document.getElementById('bill-patient').value = bill.p_id;
    document.getElementById('bill-amount').value = bill.total_amount;
    document.getElementById('bill-status').value = bill.payment_statue;
    document.getElementById('bill-due').value = bill.due;

    document.getElementById('bill-form-title').textContent = 'Edit Bill';
    document.getElementById('bill-submit').textContent = 'Update Bill';
    document.getElementById('bill-cancel').style.display = 'inline-block';

    document.getElementById('bill-form').scrollIntoView({ behavior: 'smooth' });
}

function resetBillForm() {
    document.getElementById('bill-form').reset();
    document.getElementById('bill-form-title').textContent = 'New Bill';
    document.getElementById('bill-submit').textContent = 'Add Bill';
    document.getElementById('bill-cancel').style.display = 'none';
    document.getElementById('bill-due').value = '0.00';
}

function handleBillSubmit() {
    const billId = document.getElementById('bill-id').value;
    const data = {
        p_id: document.getElementById('bill-patient').value,
        total_amount: document.getElementById('bill-amount').value,
        payment_statue: document.getElementById('bill-status').value,
        due: document.getElementById('bill-due').value || 0.00
    };

    if (!data.p_id || !data.total_amount || !data.payment_statue) {
        showMessage('Required fields are missing', 'error');
        return;
    }

    const url = billId ? `http://localhost:3000/bill/${billId}` : 'http://localhost:3000/bill';
    const method = billId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showMessage(result.error, 'error');
        } else {
            showMessage(billId ? 'Bill updated successfully' : 'Bill added successfully', 'success');
            resetBillForm();
            loadBills();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('An error occurred', 'error');
    });
}

function deleteBill(billId) {
    if (!confirm('Are you sure you want to delete this bill?')) return;

    fetch(`http://localhost:3000/bill/${billId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showMessage(result.error, 'error');
        } else {
            showMessage('Bill deleted successfully', 'success');
            loadBills();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('An error occurred', 'error');
    });
}