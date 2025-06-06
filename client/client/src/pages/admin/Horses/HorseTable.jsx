import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './HorseStyles.css';
const API_URL = process.env.REACT_APP_API_URL;

const HorseTable = () => {
    const[horses, setHorses] = useState([]);
    const[loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}horses`)
            .then((res) => res.json())
            .then((data) => {
                setHorses(data.horses || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching horses:', err);
                setLoading(true);
            });
    }, []);

    if(loading) {
        return (
            <p>Loading horses</p>
        );
    }

    if(horses.length === 0) {
        return (
            <p>No horses found.</p>
        );
    }

    return (
        <div className="horse-grid">
            {horses.map((horse) => (
                <div className="horse-card key={horse._id">
                    <img src={horse.image || '/resources/photos/horse-placeholder.jpg'}
                        alt={horse.name} className="horse-image"
                    />
                    <h3>{horse.name}</h3>
                    <p><strong>Age:</strong> {horse.age}</p>
                    <p><strong>Breed:</strong> {horse.breed}</p>
                    <p><strong>Stable:</strong> {horse.stable}</p>
                    <Link to={`${horse._id}/edit`} className="edit-button">Edit</Link>
                </div>
            ))}
        </div>
    );
};

export default HorseTable;