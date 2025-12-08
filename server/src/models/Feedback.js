import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    suggestions: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    wouldAttendAgain: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one feedback per user per event
feedbackSchema.index({ event: 1, user: 1 }, { unique: true });

feedbackSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject({ versionKey: false });
  delete obj.__v;
  return obj;
};

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;

