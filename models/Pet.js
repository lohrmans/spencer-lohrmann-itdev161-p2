import mongoose from 'mongoose';

const PetSchema = new mongoose.Schema({
  user: {
    type: 'ObjectId',
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  lastInteractionDate: {
    type: Number,
    default: Date.now
  }
});

const Pet = mongoose.model('pet', PetSchema);

export default Pet;