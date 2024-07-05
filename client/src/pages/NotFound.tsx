import Navbar from '../components/Navbar';
import React from "react";


export default function NotFound() {
  return (
    <>
        <Navbar />
      <div className="page underwork">
        <h1 style={{ textAlign: 'center', color: 'var(--primary)' }}>
          404 | Not Found
        </h1>
      </div>

    </>
  );
}
