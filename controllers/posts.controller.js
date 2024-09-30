import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

export const createPost = async (request, response) => {
    const { title } = request.body;
    const file = request.file;
    const userId = request.userId;

    try {

        if (!file) {
            return response.status(400).send({ error: "Please upload an image" });
        }


        if (!title) {
            return response.status(400).json({ error: "Lütfen tüm alanları doldurun" });
        }


        const newPost = await Post.create({
            title,
            body: file.path,
            postedBy: userId,
        });

        response.status(201).json({ result: newPost, msg: "Gönderi başarıyla oluşturuldu" });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
};

export const deletePost = async (request, response) => {
    const { postId } = request.params;
    const userId = request.userId;

    try {
        const post = await Post.findOne({ _id: postId, postedBy: userId });

        if (!post) {
            return response.status(404).json({ error: "Gönderi bulunamadı" });
        }

        await Post.deleteOne({ _id: postId, postedBy: userId });

        response.status(200).json({ msg: "Gönderi başarıyla silindi" });
    } catch (error) {
        response.status(500).json({ error: "Gönderi silinirken bir hata oluştu" });
    }
};

export const likeUnlikePost = async (request, response) => {
    const { id } = request.params;
    const userId = request.userId;


    if (!mongoose.Types.ObjectId.isValid(id)) {
        return response.status(400).json({ error: 'Geçersiz postId formatı' });
    }

    const post = await Post.findById(id);   

    if (!post) {
        return response.status(404).send({ error: 'Post bulunamadı' });
    }

    if (post.likes.includes(userId)) {
        const index = post.likes.indexOf(userId);
        post.likes.splice(index, 1);
        await post.save();
        return response.status(200).json({ message: "Post Unliked" });
    } else {
        post.likes.push(userId);
        await post.save();
        return response.status(200).json({ message: "Post Liked" });
    }
};

export const newComment = async (request, response) => {

    const { id } = request.params;

    const { comment } = request.body;
    const post = await Post.findById(id);
    const userId = request.userId;

    if (!post) {
        return response.status(404).send({ error: 'Not Found' });
    }
    const senderUser = await User.findById(userId);
    post.comments.push({
        user: userId,
        comment: comment,
        username: senderUser.userName,
        profilePic: senderUser.profilePic
    });

    await post.save();

    return response.status(200).json({
        message: "Comment Added",
        data:post
    });
};

export const deleteComment = async (request, response) => {
    const { id, commentId } = request.params;
    const userId = request.userId;

    const post = await Post.findById(id);

    if (!post) {
        return response.status(404).send({ error: 'Post Not Found' });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
        return response.status(404).send({ error: 'Comment Not Found' });
    }

    if (comment.user.toString() !== userId) {
        return response.status(403).send({ error: 'Unauthorized' });
    }

    post.comments = post.comments.filter(comment => comment._id.toString() !== commentId);

    await post.save();

    return response.status(200).json({
        message: "Comment Deleted"
    });
};



export const getAllPosts = async (request, response) => {
    try {
        const posts = await Post.find({})
            .populate({
                path: 'postedBy',
                select: 'userName profilePic'
            });
        response.status(200).json({ posts });
    } catch (error) {
        response.status(500).json({ error: "Gönderiler getirilirken bir hata oluştu" });
    }
};

export const getFollowingPosts = async (request, response) => {
    try {
        const loggedInUser = await User.findById(request.userId);

        if (!loggedInUser) {
            return response.status(404).send({ error: "Logged in user not found" });
        }

        // Add the logged-in user's ID to the list of following users
        const followingUsers = [...loggedInUser.following, loggedInUser._id];

        const posts = await Post.find({ postedBy: { $in: followingUsers } })
            .populate({
                path: 'postedBy',
                select: 'userName profilePic'
            });

        response.status(200).json({ posts });
    } catch (error) {
        console.error("Error in getFollowingPosts:", error);
        response.status(500).json({ error: "Error fetching posts" });
    }
};


export const getUserPost = async (request, response) => {
    const { id } = request.params; // Assuming id is passed as a parameter
    try {
        const posts = await Post.find({ postedBy: id }).populate('postedBy', 'profilePic userName'); // Populate postedBy field with username

        if (!posts) {
            return response.status(200).json({ });
        }

        response.status(200).json({ posts });
    } catch (error) {
        console.error('Error fetching user posts:', error);
        response.status(500).json({ error: 'Server error' });
    }
};

export const getFollowingsPosts = async (request, response) => {
    try {
        const userId = request.userId;
        const user = await User.findOne({ _id: userId }).populate('following', '_id username');

        
        if (!user) {
            return response.status(404).send({ error: 'User not found' });
        }

        const followings = user.following;

        console.log(followings);

        const posts = await Promise.all(followings.map(async (following) => {
            return await Post.find({ postedBy: following._id }).populate('postedBy', '_id userName');
        }));

        // Flatten the array of arrays
        const flattenedPosts = [].concat(...posts);

        response.status(200).send({ posts: flattenedPosts });
    } catch (error) {
        console.error('Error fetching followings posts:', error);
        response.status(500).send({ error: 'Internal Server Error' });
    }
};
// export const getFollowingPosts = async (req, res) => {
//     try {
//       const user = await User.findById(req.user.id).populate('following');
//       const followingIds = user.following.map(user => user._id);
  
//       const posts = await Post.find({ postedBy: { $in: followingIds } }).populate('postedBy').sort({ createdAt: -1 });
  
//       res.status(200).json(posts);
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   };