const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage, generateLocationMessage} = require('./utils/messages');
const {addUser, getUser, getUsersInRoom,removeUser} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT;
const publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath));

// filter for messages
const filter = new Filter();
filter.removeWords('hell');

io.on('connection', (socket) => {
    let strike = 0;
    socket.on('join', (options, callback) => {
        const {user, error} = addUser({id: socket.id, ...options});
        if (error) {
            return callback(error);
        }

        socket.join(user.room);
        socket.emit('notification', {
            notification: `Welcome ${user.username}`,
            type: "success",
        });
    
        socket.broadcast.to(user.room).emit('notification', {
            notification: `${user.username} has joined!`,
            type: "success",
        });
        const {users = []} = getUsersInRoom(user.room);
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: users,
        });

        callback();
    })
    
    socket.on('sendMessage', (message, callback) => {
        const {user, error} = getUser(socket.id);
        if (error) {
            return callback(error);
        }
        if (filter.isProfane(message) && strike < 5) {
            strike++;
            io.to(user.room).emit('message', generateMessage(user, filter.clean(message)));
            return callback(`Strike ${strike} !!! Please don't use profane language, otherwise you will be blocked!`);
        } else if (strike >= 5) {
            return callback('You have been banned for using profone language!!!');
            // socket.disconnect();
        }

        io.to(user.room).emit('message', generateMessage(user, message));
        callback();
    })

    socket.on("sendLocation", (position, callback) => {
        if (strike >= 5) {
            return callback("You have been banned for using profone language!!!");
        }

        const {user, error} = getUser(socket.id);
        if (error) {
            return callback(error);
        }
        
        socket.broadcast.to(user.room).emit('locationMessage', generateLocationMessage(user, position));
        callback();
    });

    socket.on('disconnect', () => {
        const {user, error} = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('notification', {
                notification: `${user.username} has left!`,
                type: "alert",
            });
            const {users = []} = getUsersInRoom(user.room);
            io.to(user.room).emit('roomData', {
                room: user.room,
                users,
            });
        }
        
    })
})

server.listen(port, () => {
    console.log("Chat app is running on", port)
})