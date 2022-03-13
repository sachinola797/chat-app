const users = [];

const addUser = ({id, username, room, color}) => {
    // Clean the data
    username = username.trim();
    room = room.trim();
    color = color.trim().toLowerCase();

    // validate the data
    if (!username || !room) {
        return {
            error: "Username and room are required",
        }
    }

    // Check for existing user
    const existingUser = users.find(user => user.room.toLowerCase() === room.toLowerCase() && user.username.toLowerCase() === username.toLowerCase());
    
    // validate username
    if (existingUser) {
        return {error: "Username is in use in this chat room!"};
    }

    // Store user
    const user = { id, username, room, color};
    users.push(user);
    return { user };
}

const removeUser = (id) => {
    // fetch & delete the user by id
    const index = users.findIndex(user => user.id === id);
    if (index  !== -1) {
        return {user: users.splice(index, 1)[0]};
    }
    return {error: "User not found!"};
}

const getUser = (id) => {
    const user = users.find(user => user.id === id);
    return user ? {user}: {error: "User not found!"};
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    const filteredUsers = users.filter(user => user.room.toLowerCase() === room);
    return filteredUsers.length > 0 ? {users: filteredUsers}: {error: "Users not found!"};
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
}