// src/components/Button.tsx
import React from "react";

interface ButtonProps {
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
    type?: "button" | "submit" | "reset"; // Explicitly define the valid values for the type prop
}

const Button: React.FC<ButtonProps> = ({ onClick, children, className = "", style = {}, disabled = false, type = "button" }) => {
    return (
        <button
            type={type}
            className={`smm_main_btn ${className}`}
            onClick={!disabled ? onClick : undefined}
            style={{ ...style, opacity: disabled ? 0.5 : 1, minHeight: '36px' }}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
