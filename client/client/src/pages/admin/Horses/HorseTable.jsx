import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
        <div>
            <h2>Horse List</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Breed</th>
                        <th>Stable</th>
                    </tr>
                </thead>
                <tbody>
                    {horses.map((horse) => (
                        <tr key={horse._id}>
                            <td>{horse.name}</td>
                            <td>{horse.age}</td>
                            <td>{horse.breed}</td>
                            <td>{horse.stable}</td>
                            <td>
                                <Link to={`${horse._id}/edit`}>Edit</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default HorseTable;