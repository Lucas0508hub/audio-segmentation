import { useState } from 'react';
import Router from 'next/router';
import Cookie from 'js-cookie';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username, password }),
    });
    const data = await res.json();
    if (data.access_token) {
      Cookie.set('token', data.access_token);
      Router.push('/dashboard');
    } else {
      alert('Login failed');
    }
  };

  return (
    <form onSubmit={submit} className="max-w-md mx-auto mt-20 p-4 border rounded">
      <h1 className="text-xl mb-4">Login</h1>
      <input
        type="text"
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="Username"
        className="w-full mb-2 p-2 border rounded"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full mb-4 p-2 border rounded"
      />
      <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded">
        Login
      </button>
    </form>
  );
}
