// frontend/src/components/storybook/FloatingMenu.jsx

import React, { useState } from 'react';
import './FloatingMenu.css';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faComment, faTable, faChartBar, 
  faBox, faUser, faSignInAlt, faUserPlus, faSignOutAlt,
  faTimes, faBolt
} from '@fortawesome/free-solid-svg-icons';

const FloatingMenu = ({ user, role, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { to: '/', icon: faHome, label: 'Главная' },
    { to: '/chat', icon: faComment, label: 'Чат' },
    { to: '/table', icon: faTable, label: 'Таблица' },
    { to: '/dashboard', icon: faChartBar, label: 'Дашборд' },
    { to: '/suppliers', icon: faBox, label: 'Поставщики' },
  ];

  if (role === 'operator') {
    menuItems.push({ to: '/operator-chat', icon: faBolt, label: 'Оператор' });
  }

  return (
    <div className="floating-menu">
      {/* Руна-кнопка */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rune-button"
        aria-label="Меню"
      >
        <span className="rune-symbol">ᚠ</span>
      </button>

      {/* Меню */}
      <div className={`menu-items ${isOpen ? 'open' : ''}`}>
        {menuItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="menu-item"
            onClick={() => setIsOpen(false)}
          >
            <FontAwesomeIcon icon={item.icon} className="menu-icon" />
            <span className="menu-label">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Авторизация (нижний правый угол) */}
      <div className="user-profile">
        {user ? (
          <div className="user-info">
            <div className="user-avatar">{user.username[0].toUpperCase()}</div>
            <span className="user-name">{user.username}</span>
            <button onClick={onLogout} className="logout-btn">
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="auth-btn login">
              <FontAwesomeIcon icon={faSignInAlt} />
              <span>Вход</span>
            </Link>
            <Link to="/register" className="auth-btn register">
              <FontAwesomeIcon icon={faUserPlus} />
              <span>Регистрация</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingMenu;