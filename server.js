const path = require('path');
const http = require('http')
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin,
    getCurrentUser,userLeave,
    getRoomUsers }=require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


app.use(express.static(path.join(__dirname,'public')));

const botName = 'ChatCord Bot';

io.on('connection' , socket =>{

    socket.on('joinRoom',({username,room})=>

    {
        const user = userJoin(socket.id,username,room);
        socket.join(user.room);
        console.log('new');
        socket.emit('message',formatMessage(botName,'Messages are end-end encrypted'));
        socket.emit('message',formatMessage(botName,'welcome to uchat'));
    
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`));


        //send
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room),
          });

    });

   
   // socket.broadcast.to(user.room).emit('message',formatMessage(botName,'a user'));
   

    //listen
    socket.on('chatMessage',msg =>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    });
    socket.on('disconnect',() =>
    {
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`))

            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room),
              });
        }
        
        //io.emit('message' ,formatMessage)
    }

    )
        
        
 
    
});
const PORT = 3000 || process.env.PORT;

server.listen(PORT,() =>
{
    console.log(`server running on port ${PORT}`);
})