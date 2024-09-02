const socket = io();

let messages = document.getElementById('messages');
let form = document.getElementById("form");
let mInput = document.getElementById("input");
let nameForm = document.getElementById('name-form');
let nInput = document.getElementById('name');
let uName = document.getElementById('username');
let roomForm = document.getElementById('room-form');
let rInput = document.getElementById('room');
let disconnectBtn = document.getElementById('disconnect-btn');
let roomName = document.getElementById('room-name');
let typingIndicator = document.getElementById('typing');
let rRooms = document.getElementById('recent-rooms');

let username = 'Anonymous';
let currentRoom = '';

let recentRooms = [];

const joinRoom = (room) => {
  currentRoom = room;
  roomName.textContent = currentRoom;
  socket.emit('join room', currentRoom);
  disconnectBtn.style.display = "block";
  messages.innerHTML = '';
  console.log(`Joined chat: ${currentRoom}`);
};

const updateRecentRoomsList = () => {
  rRooms.innerHTML = '';
  recentRooms.forEach((room) => {
    let listItem = document.createElement('li');
    listItem.textContent = room;
    listItem.onclick = () => joinRoom(room);
    rRooms.appendChild(listItem);
  });
};


uName.textContent = 'username: ' + username;

if (currentRoom === '') {
  disconnectBtn.style.display = "none";
};

nameForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (nInput.value) {
    username = nInput.value;
    uName.textContent = 'username: ' + username;
    nInput.value = '';
  }
});

roomForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (rInput.value) {
    const room = rInput.value;
    if (!recentRooms.includes(room)) {
      recentRooms.push(room);
      updateRecentRoomsList();
    }
    joinRoom(room);
    rInput.value = '';
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (mInput.value && currentRoom) {
    socket.emit("chat message", { room: currentRoom, user: username, message: mInput.value });
    socket.emit("stop typing", { room: currentRoom, user: username });
    mInput.value = '';
  }
});

mInput.addEventListener("input", () => {
  if (mInput.value && currentRoom) {
    socket.emit("typing", { room: currentRoom, user: username });
  } else {
    socket.emit("stop typing", { room: currentRoom, user: username });
  }
});

socket.on('typing', (data) => {
  typingIndicator.textContent = `${data.user} is typing...`;
});

socket.on('stop typing', () => {
  typingIndicator.textContent = '';
});

disconnectBtn.addEventListener('click', () => {
  if (currentRoom) {
    socket.emit('leave room', currentRoom);
    currentRoom = '';
    roomName.textContent = 'Join room to be able to send message'
    messages.innerHTML = '';
    disconnectBtn.style.display = "none";
  }
});

socket.on('chat message', (data) => {
  let item = document.createElement('li');
  item.textContent = `${data.user}: ${data.message}`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});
