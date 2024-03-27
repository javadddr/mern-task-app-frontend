import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:3001/users', { // Make sure the URL points to your backend
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    if (response.ok) {
      // Handle success
      navigate('/login'); // or wherever you want to redirect after successful signup
    } else {
      // Handle failure
      alert('Signup failed');
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <h1>Sign Up</h1>
      <input
  type="email"
  placeholder="Email"
  autoComplete="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
<input
  type="text"
  placeholder="Username"
  autoComplete="username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>
<input
  type="password"
  placeholder="Password"
  autoComplete="new-password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

      <button type="submit">Sign Up</button>
    </form>
  );
}

export default SignUp;
