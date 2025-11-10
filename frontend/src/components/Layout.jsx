import React from 'react';
import { Outlet } from 'react-router-dom'; // 1. Importe o Outlet
import Sidebar from './Sidebar';
import Header from './Header';

function Layout() {
  return (
    <div className="flex bg-bg-main min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="p-8">
          <Outlet /> 
        </div>

      </main>
    </div>
  );
}

export default Layout;