import Navbar from '../components/Navbar';
import React from "react";
import Icon from "../components/Icon.tsx";
import "../styles/home.css"

export default function Home() {
    const redirectToExternal = (url) => {
        window.location.href = url;
    };

    return (
        <>
            <Navbar />

            <div className={"home_main"}>
                <div id="home_main_title">Moldtelecom Dashboard</div>
                <div className={"home_empty_space"}>
                    <span>Usefull link:</span>
                </div>
                <div className="home_main_select">
                    <div className={"home_main_select_block"}
                         onClick={() => redirectToExternal('https://moldtelecomjsc.sharepoint.com/')}>
                        <Icon type="sharepoint"/>
                        <div className={"home_main_select_block_text"}>SharePoint</div>
                    </div>
                </div>

                <div className={"home_empty_space"}>
                    <br/> <span>Social platforms:</span>
                </div>
                <div className="home_main_select">
                    <div className={"home_main_select_block"}
                         onClick={() => redirectToExternal('https://www.instagram.com/moldtelecom.md/')}>
                        <Icon type="instagram"/>
                        <div className={"home_main_select_block_text"}>Instagram</div>
                    </div>
                    <div className={"home_main_select_block"}
                         onClick={() => redirectToExternal('https://www.facebook.com/Moldtelecom/')}>
                        <Icon type="facebook"/>
                        <div className={"home_main_select_block_text"}>Facebook</div>
                    </div>
                    <div className={"home_main_select_block"}
                         onClick={() => redirectToExternal('https://www.tiktok.com/@moldtelecom.md')}>
                        <Icon type="tiktok"/>
                        <div className={"home_main_select_block_text"}>Tiktok</div>
                    </div>
                    <div className={"home_main_select_block"}
                         onClick={() => redirectToExternal('https://www.linkedin.com/company/moldtelecom')}>
                        <Icon type="linkedin"/>
                        <div className={"home_main_select_block_text"}>Linkedin</div>
                    </div>
                    <div className={"home_main_select_block"}
                         onClick={() => redirectToExternal('https://ok.ru/moldtelecom')}>
                        <Icon type="odnoklassniki"/>
                        <div className={"home_main_select_block_text"}>Odnoklassniki</div>
                    </div>
                    <div className={"home_main_select_block"}
                         onClick={() => redirectToExternal('https://www.youtube.com/channel/UC7ETXBNXYyQP_FnzeXKlwEQ')}>
                        <Icon type="youtube"/>
                        <div className={"home_main_select_block_text"}>Youtube</div>
                    </div>
                    <div className={"home_main_select_block"}
                         onClick={() => redirectToExternal('https://t.me/MoldtelecomMd')}>
                        <Icon type="telegram"/>
                        <div className={"home_main_select_block_text"}>Telegram</div>
                    </div>
                </div>
                <div className={"home_empty_space"}>
                    <br/> <span>Other resources:</span>
                </div>
                <div className="home_main_select">
                    <div className={"home_main_select_block"}
                         onClick={() => redirectToExternal('https://reporting.internal.moldtelecom.md/Timex/timex_login.php?page=1')}>
                        <Icon type="time"/>
                        <div className={"home_main_select_block_text"}>Timex</div>
                    </div>
                </div>

            </div>

        </>
    );
}
