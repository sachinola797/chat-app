const generateMessage = (user, message) => {
    return {
        message,
        user,
        createdAt: new Date().getTime(),
    }
}

const generateLocationMessage = (user, position) => {
    return {
        locationURL: `https://google.com/maps?q=${position.latitude},${position.longitude}`,
        user,
        createdAt: new Date().getTime(),
    }
}

// const generateNotification = (socket, message) => {
//     return {
//         message,
//         user: socket.id,
//         createdAt: new Date().getTime(),
//     }
// }

module.exports = {
    generateMessage,
    generateLocationMessage,
}