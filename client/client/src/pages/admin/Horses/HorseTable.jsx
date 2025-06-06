import React, { useEffect, useState } from 'react';

const HorseTable = () => {
    const[horses, setHorses] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/horses')
            .then((res) => res.json())
            .then((data) => setHorses(data.horses))
            .catch((err) => console.error('Error fetching horses:', err));
    }, []);

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
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default HorseTable;