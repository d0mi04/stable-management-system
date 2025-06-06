import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';

const HorseForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [horse, setHorse] = useState({
        name: '',
        age: '',
        breed: '',
        stable: '',
    });

    useEffect(() => {
        if(id) {
            fetch(`http://localhost:5000/horses/${id}`)
                .then((res) => res.json())
                .then((data) => setHorse(data))
                .catch((err) => console.error('Error fetching horse data:', err)); 
        }
    }, [id]);

    const handleChange = (e) => {
        setHorse({ ...horse, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = id ? 'PUT' : 'POST';
        const url = id ? `http://localhost:5000/horses/${id}` : 'http://localhost:5000/horses';

        try {
            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(horse)
            });
            navigate('/admin/horses');
        } catch (err) {
            console.error('Error saving horse:', err);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>{id ? 'Edit Horse' : 'Add new Horse'}</h2>
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
                name="stable"
                placeholder="Horse Stable"
                value={horse.stable}
                onChange={handleChange}
                required
            />
            <button type="submit">{id ? 'Update' : 'Create'}</button>
        </form>
    );
};

export default HorseForm;