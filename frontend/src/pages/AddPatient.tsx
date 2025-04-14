import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AddPatient.css';

interface PatientData {
  name: string;
  age: string;
  gender: string;
  phoneNumber: string;
  email: string;
  address: string;
  avatar: File | null;
  avatarPreview: string;
}

const AddPatient = () => {
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState<PatientData>({
    name: '',
    age: '',
    gender: '',
    phoneNumber: '',
    email: '',
    address: '',
    avatar: null,
    avatarPreview: '',
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPatientData({
      ...patientData,
      [name]: value,
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPatientData({
        ...patientData,
        avatar: file,
        avatarPreview: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      // Create form data to handle file upload
      const formData = new FormData();
      Object.entries(patientData).forEach(([key, value]) => {
        if (key === 'avatar' && value) {
          formData.append(key, value);
        } else if (key !== 'avatarPreview') {
          formData.append(key, value as string);
        }
      });

      // TODO: Replace with your API endpoint
      const response = await fetch('http://localhost:5000/api/patients', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Patient added successfully!');
        navigate('/patients'); // Redirect to patients list page
      } else {
        alert('Failed to add patient.');
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
        <div className="form-group avatar-section">
          <label htmlFor="avatar">Patient Avatar</label>
          <div className="avatar-upload">
            {patientData.avatarPreview && (
              <img
                src={patientData.avatarPreview}
                alt="Avatar preview"
                className="avatar-preview"
              />
            )}
            <input
              type="file"
              id="avatar"
              name="avatar"
              accept="image/*"
              onChange={handleFileChange}
            />
            <label htmlFor="avatar" className="upload-button">
              Choose Image
            </label>
          </div>
        </div>

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