import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import './App.css';
import Register from './components/Register/Register';
import Login from './components/Login/Login';
import PetList from './components/PetList/PetList';
import Pet from './components/Pet/Pet';
import CreatePet from './components/Pet/CreatePet';
import EditPet from './components/Pet/EditPet';

//Creates main component for app.
class App extends React.Component {
  state = {
    pets: [],
    pet: null,
    token: null,
    user: null
  }

  //Authenticates user when app loads
  componentDidMount() {
      this.authenticateUser();
  }

  //Sends authenticateUser request to api
  authenticateUser = () => {
    const token = localStorage.getItem('token');

    if(!token) {
      localStorage.removeItem('user');
      this.setState({ user: null });
    }

    if (token) {
      const config = {
        headers: {
          'x-auth-token': token
        }
      };
      axios
        .get('http://localhost:5000/api/auth', config)
        .then((response) => {
          localStorage.setItem('user', response.data.name);
          this.setState(
            { 
              user: response.data.name,
              token: token
            },
            () => {
              this.loadData();
            }
          );
        })
        .catch((error) => {
          localStorage.removeItem('user');
          this.setState({ user: null });
          console.error(`Error logging in: ${error}`);
        });
    }
  };

  //Fetches list of pets from api
  loadData = () => {
    const { token } = this.state;

    if (token) {
      const config = {
        headers: {
          'x-auth-token': token
        }
      };
      axios
        .get('http://localhost:5000/api/pets', config)
        .then(response => {
          this.setState({
            pets: response.data
          });
        })
        .catch(error => {
          console.error(`Error fetching data: ${error}`);
        });
    }
  };

  //Resets state and user information
  logOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.setState({ user: null, token: null, pets:[], pet: null });
  }

  //Sets pet state variable to selected pet
  viewPet = pet => {
    this.setState({
      pet: pet
    });
  };

  //Sends deletePet request to api
  deletePet = pet => {
    const { token } = this.state;

    if (token) {
      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      axios
        .delete(`http://localhost:5000/api/pets/${pet._id}`, config)
        .then(response => {
          const newPets = this.state.pets.filter(p => p._id !== pet._id);
          this.setState({
            pets: [...newPets],
            pet: null
          });
        })
        .catch(error => {
          console.error(`Error deleting pet: ${error}`);
        });
    }
  };

  //Sends interactWithPet request to api
  interactWithPet = pet => {
    const { token } = this.state;

    if (token){
      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      axios
        .put(`http://localhost:5000/api/pets/${pet._id}/interact`, {}, config)
        .then(response => {
          const newPet = pet
          newPet.lastInteractionDate = Date.now()

          this.onPetUpdated(newPet)
        })
        .catch(error => {
          console.error(`Error interacting with pet: ${error}`);
        });
    }
  };

  //Updates pets state variable
  onPetCreated = pet => {
    const newPets = [...this.state.pets, pet];

    this.setState({
      pets: newPets
    });
  };

  //Updates list of pets with updated pet
  onPetUpdated = pet => {
    const newPets = [...this.state.pets];
    const index = newPets.findIndex(p => p._id === pet._id);
    
    newPets[index] = pet;

    this.setState({
      pets: newPets
    });
  };

  //Removes current pet.
  resetPet = pet => {
    this.setState({ pet: null });
  };

  //Renders components
  render() {
    let { user, pets, pet, token } = this.state;
    const authProps = {
      authenticateUser: this.authenticateUser
    }

    return (
      <Router>
        <div className="App">
          <header className="App-header">
            <h1>CHUNKY <span role="img" aria-label="heart eyes">🥰</span> PETS</h1>
            <ul>
              <li>
                {user ? 
                  <Link to="/new-pet">New Pet</Link> :
                  <Link to="/register">Register</Link>
                }
              </li>
              <li>
                {user ? 
                  <Link to="" onClick={this.logOut}>Log out</Link> :
                  <Link to="/login">Log in</Link> 
                }
                
              </li>
            </ul>
          </header>
          <main>
            <Switch>
              <Route exact path="/">
                {user ? (
                  <React.Fragment>
                    <div className="Pet-container">
                      <div className="Pet-list">
                        <PetList
                          pets={pets} 
                          clickPet={this.viewPet} 
                        />
                      </div>
                      <Pet
                        class="Current-pet"
                        pet={this.state.pet}
                        interactWithPet={this.interactWithPet}
                        deletePet={this.deletePet}
                      />
                    </div>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <div className="new-user">
                      <p>Register or Login to view pets!</p>
                    </div>
                  </React.Fragment>
                )}
              </Route>
              <Route path="/new-pet">
                <CreatePet token={token} onPetCreated={this.onPetCreated} />
              </Route>
              <Route path="/rename-pet/:petId">
                <EditPet
                  token={token}
                  pet={pet}
                  onPetUpdated={this.onPetUpdated}
                  resetPet={this.resetPet}
                />
              </Route>
              <Route exact path="/register"
                render={() => <Register {...authProps} />}
              />
              <Route exact path="/login"
                render={() => <Login {...authProps} />}
              />
            </Switch>
          </main>
        </div>
      </Router>
    );
  }
}

export default App;
