import React from "react";
import { useHistory } from 'react-router-dom';
import happy from '../../assets/happy.png';
import sad from '../../assets/sad.png';
import './styles.css';

const Pet = props => {
  const { pet, interactWithPet, deletePet } = props;
  
  let history = useHistory();

  const rename = () => { 
    history.push(`/rename-pet/${pet._id}`);
  }

  const getMood = () => {
    const lid = pet.lastInteractionDate;
    return Date.now() - lid > 5000 ? sad : happy;
  }

  //3600000

  return (
    <div>
    {
      pet ? (
        <div>
          <img style={{backgroundColor: pet.color}} src={getMood()} alt="Pet" width="400" height="400"/>
          <h1>{pet.name}</h1>
          <button onClick={() => interactWithPet(pet)}>Pat</button>
          <button onClick={() => interactWithPet(pet)}>Feed</button>
          <button onClick={() => rename()}>Rename</button>
          <button onClick={() => deletePet(pet)}>Delete</button>
        </div>
        ) : (
          <div className="No-pet">
            <p>Select a pet, or create a new one above!</p>
          </div>  
        )
      }
    </div>
    
  )
}

export default Pet;