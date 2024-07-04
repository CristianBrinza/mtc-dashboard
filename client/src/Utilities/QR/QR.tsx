import React, { useState } from "react";
import "./qr.css";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon.tsx";
import Button from "../../components/Button.tsx";

export default function QR() {
    const navigate = useNavigate();
    const [content, setContent] = useState("");
    const [qrCodeURL, setQrCodeURL] = useState("");

    const htmlEncode = (value) => {
        const div = document.createElement("div");
        div.appendChild(document.createTextNode(value));
        return div.innerHTML;
    };

    const downloadImage = (url, filename) => {
        fetch(url)
            .then((response) => response.blob())
            .then((blob) => {
                // Create a URL for the blob object
                const blobUrl = window.URL.createObjectURL(blob);

                // Set the download link href to the blob URL and simulate a click to download
                const downloadLink = document.getElementById("download");
                downloadLink.href = blobUrl;
                downloadLink.download = filename;
                downloadLink.style.display = "block"; // Ensure the download link is visible
            })
            .catch((error) => console.error("Error downloading the image:", error));
    };

    const generateQRCode = () => {
        if (content.trim() !== "") {
            const qrCodeURL = `https://quickchart.io/chart?cht=qr&chl=${htmlEncode(content)}&chs=540x540&chld=L|0`;
            setQrCodeURL(qrCodeURL);

            // Generate the downloadable link
            downloadImage(qrCodeURL, "QRCode.png");
        } else {
            alert("Error: empty content");
        }
    };

    return (
        <>
            <div className={"qr_main"}>
                <div id="qr_main_back" onClick={() => navigate('/utilities')}>
                    <Button>
                        <Icon type="back"/>
                        Back
                    </Button>

                <div id="qr_title">QR code generator</div>
                </div>
                <div className="form-group">
                    <label htmlFor="content" id="utilities_qr_content">Content:</label>
                    <input
                        type="text"
                        className="form-control"
                        id="content"
                        placeholder="Enter content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                    <Button id="generate" className="btn btn-primary" onClick={generateQRCode}>
                        Generate
                    </Button>
                    {qrCodeURL && (
                        <>

                            <a id="download" className="utilities_qr_download btn btn-success" download="QRCode.png">
                                Download
                            </a>
                        </>
                    )}
                </div>
                {qrCodeURL && (
                <img src={qrCodeURL} className="qr_main_img qr-code img-thumbnail img-responsive" alt="QR Code"/>
                )}
            </div>
        </>
    );
}
