import Story from '../models/story.model.js';
import User from '../models/user.model.js';

export const createStory = async (request, response) => {
  try {
    const newStory = new Story({
      user: request.user.id,
      storyImage: request.file.path
    });

    const story = await newStory.save();
    response.status(201).send(story);
  } catch (error) {
    response.status(500).send(error,'Server Error');
  }
};

export const getStories = async (request, response) => {
  try {
    // Assuming request.userId contains the ID of the logged-in user
    const loggedInUserId = request.userId;

    // Fetch the logged-in user document with populated 'following' array
    const loggedInUser = await User.findById(loggedInUserId).populate('following');

    if (!loggedInUser) {
      return response.status(404).send({ error: "Logged in user not found" });
    }

    // Extract the array of user IDs from the 'following' array
    const followingIds = loggedInUser.following.map(user => user._id);

    // Find stories where the user ID is either the logged-in user's ID
    // or in the 'followingIds' array
    const stories = await Story.find({
      $or: [
        { user: loggedInUserId },  // Stories created by the logged-in user
        { user: { $in: followingIds } }  // Stories from users the logged-in user follows
      ]
    }).populate('user');

    response.status(200).send(stories);
  } catch (error) {
    console.error("Error in getStories:", error);
    response.status(500).send({ error: "Server Error" });
  }
};
