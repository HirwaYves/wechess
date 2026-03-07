// // src/pages/profile.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './profile.css'; // we'll create this

// const Profile = () => {
//   const [user, setUser] = useState(null);
//   const [registrations, setRegistrations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchProfile = async () => {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         navigate('/login');
//         return;
//       }

//       try {
//         // Fetch user details
//         const userRes = await fetch('/api/auth/me', {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         if (!userRes.ok) throw new Error('Failed to fetch user');
//         const userData = await userRes.json();
//         setUser(userData);

//         // Fetch user's tournament registrations
//         const regRes = await fetch('/api/registrations/my', {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         if (regRes.ok) {
//           const regData = await regRes.json();
//           setRegistrations(regData);
//         }
//       } catch (err) {
//         console.error(err);
//         // maybe logout if error
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [navigate]);

//   if (loading) return <div className="container">Loading...</div>;
//   if (!user) return <div className="container">Please log in.</div>;

//   return (
//     <div className="profile-page container">
//       <h1>My Profile</h1>
//       <div className="profile-card">
//         <div className="profile-avatar">
//           {user.first_name?.[0]}{user.last_name?.[0]}
//         </div>
//         <div className="profile-info">
//           <p><strong>Username:</strong> {user.username}</p>
//           <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
//           <p><strong>Email:</strong> {user.email}</p>
//           <p><strong>Country:</strong> {user.country}</p>
//           <p><strong>Rating:</strong> {user.current_rating}</p>
//           <p><strong>Member since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
//         </div>
//       </div>

//       <h2>My Tournament Registrations</h2>
//       {registrations.length === 0 ? (
//         <p>You haven't registered for any tournaments yet.</p>
//       ) : (
//         <table className="profile-registrations">
//           <thead>
//             <tr><th>Tournament</th><th>Date</th><th>Status</th></tr>
//           </thead>
//           <tbody>
//             {registrations.map(reg => (
//               <tr key={reg.id}>
//                 <td>{reg.tournament_title}</td>
//                 <td>{new Date(reg.tournament_date).toLocaleDateString()}</td>
//                 <td>{reg.status}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default Profile;

// src/pages/profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) return <div className="container">Loading...</div>;
  if (!user) return <div className="container">Please log in.</div>;

  return (
    <div className="profile-page container">
      <h1>My Profile</h1>
      <div className="profile-card">
        <div className="profile-avatar">
          {user.first_name?.[0]}{user.last_name?.[0]}
        </div>
        <div className="profile-info">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Country:</strong> {user.country}</p>
          <p><strong>Rating:</strong> {user.current_rating}</p>
          <p><strong>Member since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;