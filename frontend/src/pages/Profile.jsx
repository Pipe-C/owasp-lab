import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { api } from '../api/client.js';
import Layout from '../components/Layout.jsx';
import '../styles/Profile.css';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    const updated = await api.updateProfile({ name, email });
    setUser(updated.user);
    setMessage('Perfil actualizado.');
  }

  return (
    <Layout title="Mi perfil">
      <p className="profile__intro">
        Este formulario envía <code>PUT /api/users/profile</code>. En modo
        vulnerable no exige token CSRF y acepta cualquier campo del cuerpo
        (incluido <code>role</code>) — pruébalo desde ZAP Requester.
      </p>

      {message && <div className="profile__success">{message}</div>}

      <form onSubmit={handleSubmit} className="profile__form">
        <div className="field">
          <label htmlFor="name">Nombre</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="email">Correo</label>
          <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label>Rol actual</label>
          <p className="profile__role">{user?.role}</p>
        </div>
        <button className="btn btn-primary">Guardar</button>
      </form>
    </Layout>
  );
}
