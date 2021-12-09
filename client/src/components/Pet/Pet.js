import React from "react";
import { useHistory } from 'react-router-dom';
import happy from '../../assets/happy.png';
import sad from '../../assets/sad.png';
import './styles.css';

//Creates Pet component.
const Pet = props => {
  const { pet, interactWithPet, deletePet } = props;
  
  let history = useHistory();

  //Changes route to rename page on rename button click
  const rename = () => { 
    history.push(`/rename-pet/${pet._id}`);
  }

  //Pets become sad after 1 minute.
  const getMood = () => Date.now() - pet.lastInteractionDate > 60000 ? sad : happy;

  

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