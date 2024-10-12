const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Enhanced User Schema with Profile Data
const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, 'Username is required'], 
        unique: true, 
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [20, 'Username cannot exceed 20 characters'],
        trim: true 
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'], 
        minlength: [6, 'Password must be at least 6 characters long']
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true, 
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    profilePicture: { 
        type: String, 
        default: 'default-profile.png', // Default profile picture
    },
    bio: { 
        type: String, 
        maxlength: [160, 'Bio cannot exceed 160 characters'],
        trim: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Hash the password before saving the user document
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Only hash if password is new or changed
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Method to compare provided password with stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to update profile information (without altering the password unless specified)
userSchema.methods.updateProfile = async function (profileData) {
    const allowedUpdates = ['username', 'email', 'bio', 'profilePicture'];
    const updates = Object.keys(profileData).filter(key => allowedUpdates.includes(key));

    updates.forEach(key => {
        if (profileData[key]) {
            this[key] = profileData[key];
        }
    });

    return this.save();
};

// Schema method to change password
userSchema.methods.changePassword = async function (oldPassword, newPassword) {
    const isMatch = await this.comparePassword(oldPassword);
    if (!isMatch) throw new Error('Current password is incorrect');
    
    this.password = await bcrypt.hash(newPassword, 12);
    return this.save();
};

const User = mongoose.model('User', userSchema);
module.exports = User;
