import React from "react";

const Button = ({ onClick, children, className = "", style = {}, disabled = false }) => {
    return (
        <div
            className={`smm_main_btn ${className}`}
            onClick={!disabled ? onClick : null}
            style={{ ...style, opacity: disabled ? 0.5 : 1, minHeight:'36px' }}
        >
            {children}
        </div>
    );
};

export default Button;
