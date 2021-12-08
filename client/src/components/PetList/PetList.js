import React from 'react';
import PetListItem from './PetListItem';
import './styles.css';

const PetList = props => {
  const { pets, clickPet } = props;
  return pets.map(pet => (
    <PetListItem
      class="Pet-list"
      key={pet._id}
      pet={pet}
      clickPet={clickPet}
    />
  ));
};

export default PetList;