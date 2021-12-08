import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
// import './styles.css';

const EditPet = ({ token, pet, onPetUpdated, resetPet }) => {
  let history = useHistory();
  const [petData, setPetData] = useState({
    name: pet.name
  });
  const { name } = petData;

  const onChange = e => {
    const { name, value } = e.target;

    setPetData({
      ...petData,
      [name]: value
    });
  };

  const update = async () => {
    if (!name) {
      console.log('Name is required');
    } else {
      const newPet = {
        name: name
      };

      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        };

        // Create the pet
        const body = JSON.stringify(newPet);
        const res = await axios.put(
          `http://localhost:5000/api/pets/${pet._id}/rename`,
          body,
          config
        );

        // Call the handler and redirect
        onPetUpdated(res.data);
        history.push('/');
        resetPet();
      } catch (error) {
        console.error(`Error renaming pet: ${error.response.data}`);
      }
    }
  };

  return (
    <div className="edit-pet-container">
    <div className="edit-pet">
      <h2>Rename Pet</h2>
      <input
        name="name"
        type="text"
        placeholder="Name"
        value={name}
        onChange={e => onChange(e)}
      />
      <button onClick={() => update()}>Submit</button>
      </div>
    </div>
  );
};

export default EditPet;