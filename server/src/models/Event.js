import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    time: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'draft',
    },
    maxAttendees: {
      type: Number,
      min: 0,
    },
    requiresRSVP: {
      type: Boolean,
      default: true,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    thankYouSent: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject({ versionKey: false });
  delete obj.__v;
  return obj;
};

const Event = mongoose.model('Event', eventSchema);

export default Event;

