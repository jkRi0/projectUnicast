import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['invitation', 'reminder', 'thank-you', 'update', 'custom'],
      required: true,
    },
    channel: {
      type: String,
      enum: ['email', 'sms', 'in-app'],
      required: true,
    },
    subject: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'pending',
    },
    sentAt: {
      type: Date,
    },
    externalId: {
      type: String,
      // For tracking messages sent via external services (Twilio, SendGrid)
    },
    error: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ event: 1, recipient: 1, type: 1 });
messageSchema.index({ status: 1, createdAt: -1 });

messageSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject({ versionKey: false });
  delete obj.__v;
  return obj;
};

const Message = mongoose.model('Message', messageSchema);

export default Message;

