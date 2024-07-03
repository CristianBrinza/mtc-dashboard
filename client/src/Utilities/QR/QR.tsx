import React from "react";
import "./qr.css"
import {useNavigate} from "react-router-dom";
import Icon from "../../components/Icon.tsx";
import Button from "../../components/Button.tsx";

export default function QR() {
    const navigate = useNavigate();

    return (
       <>
           <div className={"qr_main"}>
             <div id="qr_main_back" onClick={() => navigate('/utilities')}>
               <Button >
                   <Icon type="back" />
                   Back
               </Button>
             </div>
               <div id="utilities_main_title">QR code generator</div>

           </div>
       </>
    );
}
