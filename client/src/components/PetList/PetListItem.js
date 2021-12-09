import React from 'react';
import './styles.css';

//Creates PetListItem component
const PetListItem = props => {
  const { pet, clickPet } = props;

  const handleClickPet = pet => {
    clickPet(pet);
  };

  return (
    <div>
      <div className="petListItem" onClick={() => handleClickPet(pet)}>
        <h2>{pet.name}</h2>
      </div>
    </div>
  );
};

export default PetListItem;