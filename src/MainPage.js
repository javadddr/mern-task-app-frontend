import React, { useState, useEffect,useRef } from "react";
import "./MainPage.css"
import { useNavigate } from "react-router-dom";
import io from 'socket.io-client';
const socket = io("https://mern-task-app-backend-ks55.onrender.com");
function MainPage() {
  const [users, setUsers] = useState([]);
  const [currentChatUser, setCurrentChatUser] = useState(null);
  const [messages, setMessages] = useState([]); // State to store messages
  const [text, setText] = useState("");
  const currentUserId = localStorage.getItem('userId'); // Get the current user's ID once
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const navigate = useNavigate(); // Add this line at the beginning of your component

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login'); // Redirect to login if there's no token
    }
  }, [navigate]); // Include navigate in the dependency array

  const addEmoji = (emoji) => {
    console.log(emoji); // Should log the emoji character
    setText((prevInput) => prevInput + emoji);
    setShowEmojiPicker(false);
  };
  
  const emojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
    "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
    "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥳",
    "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖",
    "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯",
    "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔",
    "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦",
    "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴",
    "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿",
    "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖",
    "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾",
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
    "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟",
  ];
  
  
  useEffect(() => {
    // Function to check if click is outside the emoji picker
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    }
  
    // Add when emoji picker is shown
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
  
    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);
  
  const logout = () => {
    localStorage.removeItem('token'); // Remove token from local storage
    localStorage.removeItem('userId'); // Remove userId from local storage
    navigate('/login'); // Redirect to login page
  };
  
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('https://mern-task-app-backend-ks55.onrender.com/users', {
          headers: {
            'Authorization': token,
          },
        });
        if (response.ok) {
          const data = await response.json();
          const currentUserId = localStorage.getItem('userId');
          const filteredData = data.filter(user => user._id !== currentUserId);
          setUsers(filteredData);
        } else {
          alert('Failed to fetch users');
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
// Function to format message date


    fetchUsers();
  }, []);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formatter = new Intl.DateTimeFormat('en', { month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    const [{ value: month },,{ value: day },,{ value: hour },,{ value: minute }] = formatter.formatToParts(date);
  
    return `${hour}:${minute} ${day}th ${month}`;
  };
  const findUserName = userId => {
    const user = users.find(user => user._id === userId);
    return user ? user.username : 'Unknown';
  };
  
  const handleUserClick = (user) => {
    setCurrentChatUser(user);
 
    setIsChatExpanded(true); // Expand the chat area
    // Fetch messages between the current user and the clicked user
    fetch(`https://mern-task-app-backend-ks55.onrender.com/messages/${currentUserId}/${user._id}`, {
  method: 'GET',
  headers: {
    'Authorization': localStorage.getItem('token'),
  },
})
.then(response => {
  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }
  return response.json();
})
.then(fetchedMessages => {
  console.log(fetchedMessages); // Log or set state as needed
  setMessages(fetchedMessages); // Assuming your backend returns an array of messages
})
.catch(error => console.error("Failed to fetch messages:", error));
  };
  useEffect(() => {
    const chatArea = document.querySelector('.chat-area ul');
    if(chatArea) {
      chatArea.scrollTop = chatArea.scrollHeight;
    }
  }, [messages]); // Depend on messages to auto-scroll whenever messages change
  useEffect(() => {
    socket.on('receiveMessage', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
        socket.off('receiveMessage');
    };
}, []);
  const sendMessage = async (toUserId, messageText) => {
    const fromUserId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    const messageData = {
      from: fromUserId,
      to: toUserId,
      text: messageText,
      // pic: "Optional picture URL here",
    };
    socket.emit('sendMessage', messageData);
    console.log('Sending message:', messageData);
  
    try {
      const response = await fetch('https://mern-task-app-backend-ks55.onrender.com/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify(messageData),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }
      setText('');
      fetch(`https://mern-task-app-backend-ks55.onrender.com/messages/${currentUserId}/${toUserId}`, {
        method: 'GET',
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        return response.json();
      })
      .then(fetchedMessages => {
        console.log(fetchedMessages); // Log or set state as needed
        setMessages(fetchedMessages); // Assuming your backend returns an array of messages
      })
      .catch(error => console.error("Failed to fetch messages:", error));
      const data = await response.json();
      console.log('Message sent successfully:', data);
      // Additional UI update logic here...
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  const handleBackButtonClick = () => {
    setIsChatExpanded(false); // Collapse the chat area
    setCurrentChatUser(null); // Optionally clear the current chat user
  };
  
  
// MainPage component structure
return (
  <div className="main-page"> {/* Apply layout styling */}
     {!isChatExpanded && (
       <div>
       <button onClick={logout}>Logout</button>
      <div className="user-list">
        <h2>User List:</h2>
        <ul>
          {users.map(user => (
            <li key={user._id} onClick={() => handleUserClick(user)}>
              {user.username} (Click on Me!)
            </li>
          ))}
        </ul>
      </div>
      </div>
    )}
       {currentChatUser && (
      <div className={`chat-area ${isChatExpanded ? 'expanded' : ''}`}>
        {isChatExpanded && (
          <button onClick={handleBackButtonClick} className="back-button">Back</button>
        )}
        <h3>Chat with {currentChatUser.username}</h3>
        <ul>
  {messages.map((msg, index) => (
    <li key={index} className={`message ${msg.from === currentUserId ? 'sent' : 'received'}`}>
      <div className="message-content">
        {msg.text}
      </div>
      <div className="message-info">
        {msg.from !== currentUserId && <span className="username">{findUserName(msg.from)}</span>}
        <span className="message-date">{formatDate(msg.date)}</span>
      </div>
    </li>
  ))}
</ul>


        <div className="chat-message-input"> {/* Input field styling */}
        <div className="chat-input-area">
        {showEmojiPicker && (
          <div className="emoji-picker" ref={emojiPickerRef}>
  {emojis.map((emoji) => (
    <button key={emoji} onClick={() => addEmoji(emoji)} className="emoji-button">
      {emoji}
    </button>
  ))}
</div>

)}


<textarea
  value={text}
  onChange={(e) => setText(e.target.value)}
  placeholder="Write a message..."
  onKeyDown={(e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent the default action to avoid a new line being added
      sendMessage(currentChatUser._id, text);
      setText('');
    } // Shift+Enter will still add a new line as default behavior of textarea
  }}
  style={{ width: '98%', height: '50px' }} // Example styling; adjust as needed
/>


        </div>
        <div className="chat-send-button"> {/* Send button styling */}
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😀</button>

          <button onClick={() => sendMessage(currentChatUser._id, text)}>Send</button>
        </div>
      </div>
      </div>
    )}
    
  </div>
);

}

export default MainPage;