import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import './HorseFormStyles.css';

const API_URL = process.env.REACT_APP_API_URL;

const HorseForm = () => {
    const { horseID } = useParams();
    const navigate = useNavigate();
    
    const [horse, setHorse] = useState({
        name: '',
        age: '',
        breed: '',
        owner: '',
        stable: '',
    });

    useEffect(() => {
        if(horseID) {
            fetch(`${API_URL}/horses/${horseID}`)
                .then((res) => res.json())
                .then((data) => setHorse(data.horse))
                .catch((err) => console.error('Error fetching horse data:', err)); 
        }
    }, [horseID]);

    const handleChange = (e) => {
        setHorse({ ...horse, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = horseID ? 'PUT' : 'POST'; // jak istnieje horseID - to wybieramy metodę PUT
        const url = horseID ? `${API_URL}horses/${horseID}` : `${API_URL}horses`;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(horse),
            });

            if (!res.ok) {
                throw new Error('Failed to save horse');
            }

            const data = await res.json();
            console.log('Horse saved: ', data);

            navigate('/admin/horses');
        } catch (err) {
            console.error('Error saving horse:', err);
        }
    };

    return (
        <form className="horse-form" onSubmit={handleSubmit}>
            <h2>{horseID ? 'Edit Horse' : 'Add new Horse'}</h2>
            <input
                type="text"
                name="name"
                placeholder="Horse Name"
                value={horse.name}
                onChange={handleChange}
                required
            />
            <input
                type="number"
                name="age"
                placeholder="Horse Age"
                value={horse.age}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="breed"
                placeholder="Horse Breed"
                value={horse.breed}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="owner"
                placeholder="Horse Owner"
                value={horse.owner}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="stable"
                placeholder="Horse Stable"
                value={horse.stable}
                onChange={handleChange}
                required
            />
            <button type="submit">{horseID ? 'Update' : 'Create'}</button>
        </form>
    );
};

export default HorseForm;