import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-5 py-3 text-center text-muted" style={{ fontSize: '0.85rem' }}>
      <p className="mb-0">© {new Date().getFullYear()} SmartAssetX. All rights reserved. Enterprise Office Asset Management System.</p>
    </footer>
  );
};

export default Footer;
