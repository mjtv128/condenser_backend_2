To run this Node.js backend, run npm install and run PORT=3001 node server

To run the node.js backend to this project, please go on https://github.com/mjtv128/condenser_backend

To run the client side to this project, please go to https://github.com/mjtv128/condenser_frontend

------

This node.js backend allows real time communication between the client and server side using socket.io (websockets) to deliver
1. live twitter news feed straight from the twitter stream API 
2. live chatroom forum with multiple users based on the topic subject 

A Node.js backend is used (instead of Rails ActionCable) because it provides realtime, bi-directional communication between the React.js client side and Node.js server.
