// components/Button.tsx
import React, { useState, ReactElement, isValidElement } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from './Icon';

interface ButtonProps {
  bgcolor?: string;
  color?: string;
  border?: string;
  border_radius?: string;
  hover_bgcolor?: string;
  hover_color?: string;
  children: React.ReactNode;
  onClick?: () => Promise<void> | void;
  to?: string;
  className?: string;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  id?: string;
}

const Button: React.FC<ButtonProps> = ({
  color,
  bgcolor,
  hover_bgcolor,
  hover_color,
  border,
  border_radius,
  children,
  onClick,
  to,
  className = '',
  style,
  type = 'button',
  disabled = false,
  id,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = async () => {
    if (onClick) {
      await onClick(); // Ensure analytics tracking completes
    }

    if (to) {
      if (
        to.startsWith('http://') ||
        to.startsWith('https://') ||
        to.startsWith('www.')
      ) {
        // Handle external links
        window.location.href = to;
      } else if (!to.startsWith('/files/')) {
        // Handle internal links
        navigate(to);
      }
    }
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: isHovered
      ? hover_bgcolor || '#D9DFFF'
      : bgcolor || '#F3F5FF',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: isHovered ? hover_bgcolor : border || '#ffffff00',
    borderRadius: border_radius || '100px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: '0px 28px',
    color: isHovered
      ? hover_color || '#212A55'
      : color || '#212A55',
    textAlign: 'center',
    fontFamily: '"Source Sans Pro"',
    fontSize: '16px',
    lineHeight:'16px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: '46px',
    textDecoration: 'none',
    opacity: disabled ? 0.1 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
    boxSizing: 'border-box',
    gap: '10px',
    paddingLeft:'22px',
    paddingRight:'22px',
    paddingBottom:'15px',
    paddingTop:'15px',
    ...style,
  };

  const buttonIconColor = isHovered ? hover_color || color : color;
  const isExternalLink = to && to.startsWith('/files/');

  return isExternalLink ? (
    <a
      id={id}
      href={to}
      style={buttonStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`${className}`}
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ) : to ? (
    <Link
      id={id}
      to={to}
      style={buttonStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`${className}`}
    >
      {children}
    </Link>
  ) : (
    <button
      id={id}
      type={type}
      style={buttonStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`${className}`}
      disabled={disabled}
    >
      {React.Children.map(children, child => {
        if (isValidElement(child) && child.type === Icon) {
          return React.cloneElement(child as ReactElement<any>, {
            color: buttonIconColor,
          });
        }
        return child;
      })}
    </button>
  );
};

export default Button;
