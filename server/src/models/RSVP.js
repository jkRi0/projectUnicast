import mongoose from 'mongoose';

const rsvpSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'declined', 'maybe'],
      default: 'pending',
    },
    respondedAt: {
      type: Date,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    attended: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one RSVP per user per event
rsvpSchema.index({ event: 1, user: 1 }, { unique: true });

rsvpSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject({ versionKey: false });
  delete obj.__v;
  return obj;
};

const RSVP = mongoose.model('RSVP', rsvpSchema);

export default RSVP;

