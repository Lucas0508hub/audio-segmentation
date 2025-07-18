import { useEffect, useState } from 'react';
import Cookie from 'js-cookie';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = Cookie.get('token');
    if (!token) {
      window.location = '/login';
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  return (
    <div className="max-w-md mx-auto mt-20">
      {user ? <h1 className="text-xl">Hello, {user.username}</h1> : <p>Loading...</p>}
    </div>
  );
}
