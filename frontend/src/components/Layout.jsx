import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const [sidebarActive, setSidebarActive] = useState(false);

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Sidebar activeMobile={sidebarActive} setActiveMobile={setSidebarActive} />
      <div className="content-wrapper d-flex flex-column flex-grow-1">
        <Navbar onToggleSidebar={() => setSidebarActive(!sidebarActive)} />
        <main className="flex-grow-1">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
