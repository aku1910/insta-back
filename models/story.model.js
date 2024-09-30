import mongoose from 'mongoose';

const { Schema } = mongoose;

const storySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  storyImage: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '24h' }
});

const Story = mongoose.model('Story', storySchema);

export default Story;
