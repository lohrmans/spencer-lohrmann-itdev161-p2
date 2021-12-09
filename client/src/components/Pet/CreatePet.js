import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import './styles.css';
import happy from '../../assets/happy.png';

//Creates CreatePet component. Receives token and onPetCreated as props.
const CreatePet = ({ token, onPetCreated }) => {
  let history = useHistory();
  const [petData, setPetData] = useState({
    name: '',
    color: '#abcdef'
  });
  const { name, color } = petData;

  //onChange event handler for text box and color picker.
  const onChange = e => {
    const { name, value } = e.target;

    setPetData({
      ...petData,
      [name]: value
    });
  };

  //Function that sends createPet request to api
  const create = async () => {
    if (!name || !color) {
      console.log('Name and color are required');
    } else {
      const newPet = {
        name: name,
        color: color
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
        const res = await axios.post(
          'http://localhost:5000/api/pets',
          body,
          config
        );

        // Call the handler and redirect
        onPetCreated(res.data);
        history.push('/');
      } catch (error) {
        console.error(`Error creating pet: ${error}`);
      }
    }
  };

  return (
    <div className="pet-container">
      <div className="pet">
        <h2>Create your new pet!</h2>
        <img style={{backgroundColor: color}} src={happy} alt="Pet" width="400" height="400"/>
        <div className="input">
          <input
            name="name"
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => onChange(e)}
          />
          <input 
            name="color"
            type="color"
            value={color}
            onChange={e => onChange(e)}
          ></input>
        </div>
        <button onClick={() => create()}>Submit</button>
      </div>
    </div>
  );
};

export default CreatePet;