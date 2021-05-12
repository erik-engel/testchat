const express = require('express');
const app = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const fs = require('fs');

const chat = fs.readFileSync(__dirname + '/public/contact.html', 'utf-8');
const admin = fs.readFileSync(__dirname + '/public/admin.html', 'utf-8');

// Routes

app.get('/', (req, res) => {
  res.send(chat);
});

app.get('/admin', (req, res) => {
  res.send(admin);
});

// Listen

const PORT = process.env.PORT || 8080;

server.listen(PORT, (error) => {
  if (error) {
    console.log(error);
  }
  console.log('Server is running on port', Number(PORT));
});
