import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ['equipment', 'personnel', 'venue', 'material', 'other'],
      default: 'other',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    status: {
      type: String,
      enum: ['available', 'assigned', 'in-use', 'completed'],
      default: 'available',
    },
    quantity: {
      type: Number,
      min: 0,
      default: 1,
    },
    requiredBy: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

resourceSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject({ versionKey: false });
  delete obj.__v;
  return obj;
};

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;

