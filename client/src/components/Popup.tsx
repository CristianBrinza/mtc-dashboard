import React from "react";
import "../styles/smm.css";

interface PopupProps {
    id: string;
    title: string;
    children: React.ReactNode;
    isVisible: boolean;
    onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ id, title, children, isVisible, onClose }) => {
    return (
        <div className={`smm_popup_block ${isVisible ? 'show' : ''}`} id={`smm_popup_block_${id}`} style={{ display: isVisible ? 'flex' : 'none' }}>
            <div className="smm_popup_block_inside">
                <svg className="smm_popup_close_button" fill="none" onClick={onClose} width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.5 19.5L19.425 4.5M19.5 19.5L4.575 4.5" stroke="#9DAEFF" strokeWidth="1.875" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div style={{ fontWeight: 700, fontSize: "24px", borderBottom: "1px solid #9DAEFF", paddingBottom: "10px" }}>{title}</div>
                <br />
                <br />
                {children}
            </div>
        </div>
    );
};

export default Popup;
