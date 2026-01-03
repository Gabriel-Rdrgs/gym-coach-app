'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function SidebarWrapper() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <Sidebar isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      <Header sidebarOpen={isOpen} onToggleSidebar={() => setIsOpen(!isOpen)} />
    </>
  );
}

