import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AddPatient.css';

interface PatientData {
  name: string;
  age: number;
  gender: string;
  phoneNumber: string;
  email: string;
  address: string;
}

const AddPatient = () => {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState<PatientData>({
    name: '',
    age: 0,
    gender: '',
    phoneNumber: '',
    email: '',
    address: ''
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'age') {
      setPatientData({
        ...patientData,
        [name]: value === '' ? 0 : parseInt(value, 10)
      });
    } else {
      setPatientData({
        ...patientData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/patients/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patientData)
      });
  
      if (response.ok) {
        const result = await response.json();
        alert(`Patient added successfully! ID: ${result.patient_id}`);
        navigate('/');
      } else {
        const errorData = await response.json();
        alert(`Failed to add patient: ${errorData.detail}`);
      }
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('An error occurred while adding the patient.');
    }
  };
  
  return (
    <div className="add-patient-container">
      <h1>Add New Patient</h1>
      <form onSubmit={handleSubmit} className="patient-form single-column">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={patientData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            min="0"
            max="120"
            value={patientData.age}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={patientData.gender}
            onChange={handleInputChange}
            required
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={patientData.phoneNumber}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={patientData.email}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            value={patientData.address}
            onChange={handleInputChange}
            rows={2}
          ></textarea>
        </div>

        <div className="form-buttons">
          <button type="button" onClick={() => navigate(-1)} className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="submit-button">
            Add Patient
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPatient;