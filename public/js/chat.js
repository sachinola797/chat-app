const socket = io();

// Elements
const $messageInput = document.querySelector("#newMessageInput");
const $sendMessage = document.querySelector('#sendMessage');
const $sendLocation = document.querySelector('#sendLocation');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('.chat__sidebar');

// Templates
const $notificationTemplate = document.querySelector('#notificationTemplate').innerHTML;
const $messageTemplate = document.querySelector('#messageTemplate').innerHTML;
const $locationTemplate = document.querySelector('#locationTemplate').innerHTML;
const $sidebarTemplate = document.querySelector('#sidebarTemplate').innerHTML;


// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });


if (!navigator.geolocation) {
    $sendLocation.remove();
}

socket.on('notification', ({notification, type="success"}) => {
    const html = Mustache.render($notificationTemplate, {
        notification: notification,
        color: THEME[type].color,
        backgroundColor: THEME[type].backgroundColor,
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.on('message', (message) => {
    const html = Mustache.render($messageTemplate, {
        message: message.message,
        user: message.user.username,
        userColor: message.user.color,
        timeStamp: moment(message.createdAt).format('h:mm A'),
    });
    
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.on('locationMessage', (locationMessage) => {
    const html = Mustache.render($locationTemplate, {
        location: locationMessage.locationURL,
        user: locationMessage.user.username,
        userColor: locationMessage.user.color,
        timeStamp: moment(locationMessage.createdAt).format('h:mm A'),
    });
    
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render($sidebarTemplate, {
        room,
        users,
    });
    $sidebar.innerHTML = html;
})

$sendMessage.addEventListener("click", ()=>{
    if ($messageInput.value === "") return;
    $sendMessage.setAttribute('disabled', 'disabled');
    $messageInput.setAttribute('disabled', 'disabled');
    socket.emit("sendMessage", $messageInput.value, (error) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Message Sent");
        }
        $sendMessage.removeAttribute('disabled');
        $messageInput.removeAttribute('disabled');
        $messageInput.value = "";
        $messageInput.focus();
        $messages.scrollTop = $messages.scrollHeight;
    });
})

$messageInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        $sendMessage.click();
    }
});

$sendLocation.addEventListener('click', ()=>{
    $sendLocation.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit("sendLocation",
            {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }, (error) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Location Shared successfully");
                }
                $sendLocation.removeAttribute('disabled');
        });
    });
})

socket.emit('join', { username, room, color: getRandomColor() }, (error) => {
    if(error) {
        alert(error);
        location.href = "/";
    }
});

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function autoScroll() {
    const offset = 10;
    // New message element
    const $newMessage = $messages.lastElementChild;
    
    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageHeight = $newMessage.offsetHeight + parseInt(newMessageStyles.marginBottom);

    // visible height
    const visibleHeight = $messages.offsetHeight;
    
    // height of messages container
    const containerHeight = $messages.scrollHeight;

    // how far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if ((containerHeight-newMessageHeight) <= (scrollOffset + offset)) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}
  