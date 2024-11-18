// Node server which will handle socket io connections
const express= require('express');
const path = require('path');
require('dotenv').config();

const app=express();
const PORT = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname, '..')));

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const io = require('socket.io')(server, {
    cors: {
        origin: "*",  // Allow all origins for Socket.IO
        methods: ["GET", "POST"]
    }
});

// const io = require('socket.io')(PORT, {
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"],
//     }
// });

const users = {};

io.on('connection', socket =>{
    //If any user joins, let other users connected to the server know!
    socket.on('new-user-joined', name =>{
        // console.log("New user", name);
        users[socket.id]=name; //update new user in name obj
        socket.broadcast.emit('user-joined', name); //broadcast an event to all other users that new user has joined
    });

    //If someone sends a message, broadcast it to other people
    socket.on('send', message =>{
        socket.broadcast.emit('receive', {message: message, name: users[socket.id]})
    });

    //If someone leaves the chat, let other know
    // 'disconnect' is an in-built event unlike previous ones
    socket.on('disconnect', () =>{
        if(users[socket.id]) {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
        }
    });
})