import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LogoutButton({ className = '', children = 'Sair', message }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout(message || 'Sessão encerrada.');
    navigate('/login', { replace: true });
  };

  return (
    <button type="button" onClick={handleLogout} className={className}>
      {children || 'Sair'}
    </button>
  );
}

export default LogoutButton;
