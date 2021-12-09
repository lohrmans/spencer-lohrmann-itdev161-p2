import express from 'express';
import connectDatabase from './config/db';
import { check, validationResult } from 'express-validator';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from 'config';
import User from './models/User';
import Pet from './models/Pet';
import auth from './middleware/auth';

// Initialize express application
const app = express();

// Connect database
connectDatabase();

// Configure Middleware
app.use(express.json({ extended: false }));
app.use(
  cors({
    origin: 'http://localhost:3000'
  })
);

// API endpoints
/**
 * @route GET /
 * @desc Test endpoint
 */
app.get('/', (req, res) =>
  res.send('http get request sent to root api endpoint')
);

app.get('/api/', (req, res) => res.send('http get request sent to api'));

/**
 * @route POST api/users
 * @desc Register user
 */
app.post(
  '/api/users',
  [
    check('name', 'Please enter your name')
      .not()
      .isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    } else {
      const { name, email, password } = req.body;
      try {
        // Check if user exists
        let user = await User.findOne({ email: email });
        if (user) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'User already exists' }] });
        }

        // Create a new user
        user = new User({
          name: name,
          email: email,
          password: password
        });

        // Encrypt the password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save to the db and return
        await user.save();

        // Generate and return a JWT token
        returnToken(user, res);
      } catch (error) {
        res.status(500).send('Server error');
      }
    }
  }
);

/**
 * @route GET api/auth
 * @desc Authorize user
 */
app.get('/api/auth', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send('Unknown server error');
  }
});

/**
 * @route POST api/login
 * @desc Login user
 */
app.post(
  '/api/login',
  [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'A password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    } else {
      const { email, password } = req.body;
      try {
        // Check if user exists
        let user = await User.findOne({ email: email });
        if (!user) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'Invalid email or password' }] });
        }

        // Check password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return res
            .status(400)
            .json({ errors: [{ msg: 'Invalid email or password' }] });
        }

        // Generate and return a JWT token
        returnToken(user, res);
      } catch (error) {
        res.status(500).send('Server error');
      }
    }
  }
);

//Function for generating a JWT token
const returnToken = (user, res) => {
  const payload = {
    user: {
      id: user.id
    }
  };

  jwt.sign(
    payload,
    config.get('jwtSecret'),
    { expiresIn: '10hr' },
    (err, token) => {
      if (err) throw err;
      res.json({ token: token });
    }
  );
};

// Pet endpoints
/**
 * @route POST api/pets
 * @desc Create pet
 */
app.post(
  '/api/pets',
  [
    auth,
    [
      check('name', 'Name is required')
        .not()
        .isEmpty(),
      check('color', 'Color is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    } else {
      const { name, color } = req.body;
      try {
        //Get the user who created the pet
        const user = await User.findById(req.user.id);

        //Create a new pet
        const pet = new Pet({
          user: user.id,
          name: name,
          color: color
        });

        //Save to the db and return
        await pet.save();

        res.json(pet);
      } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
      }
    }
  }
);

/**
 * @route GET api/pets
 * @desc Get pets
 */
app.get('/api/pets', auth, async (req, res) => {
  try {
    //Get the user who created the pet
    const user = await User.findById(req.user.id);

    const pets = await Pet.find( { user: user.id } ).sort({ name: 1 });

    res.json(pets);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

/**
 * @route GET api/pets/:id
 * @desc Get pet
 */
app.get('/api/pets/:id', auth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    //Make sure the pet was found
    if (!pet) {
      return res.status(404).json({ msg: 'Pet not found' });
    }

    // Make sure the request user created the pets
    if (pet.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    res.json(pet);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

/**
 * @route DELETE api/pets/:id
 * @desc Delete a pet
 */
app.delete('/api/pets/:id', auth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    // Make sure the pet was found
    if (!pet) {
      return res.status(404).json({ msg: 'Pet not found' });
    }

    // Make sure the request user created the pet
    if (pet.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await pet.remove();

    res.json({ msg: 'Pet removed' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

/**
 * @route PUT api/pets/:id/rename
 * @desc Update a pet's name
 */
app.put('/api/pets/:id/rename', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const pet = await Pet.findById(req.params.id);

    //Make sure the pet was found
    if (!pet) {
      return res.status(404).json({ msg: 'Pet not found' });
    }

    //Make sure the request user created the pet
    if (pet.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    //Update the pet and return
    pet.name = name || pet.name;

    await pet.save();

    res.json(pet);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

/**
 * @route PUT api/pets/:id/interact
 * @desc Update a pet's last interaction date
 */
app.put('/api/pets/:id/interact', auth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    //Make sure the pet was found
    if (!pet) {
      return res.status(404).json({ msg: 'Pet not found' });
    }

    //Make sure the request user created the pet
    if (pet.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    pet.lastInteractionDate = Date.now();

    await pet.save();

    res.json(pet);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


// Connection listener
const port = 5000;
app.listen(port, () => console.log(`Express server running on port ${port}`));
