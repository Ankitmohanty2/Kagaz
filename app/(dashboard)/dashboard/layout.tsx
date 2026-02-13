import React from 'react'
import { Sidebar } from '../components/sidebar'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="w-full h-screen overflow-hidden flex flex-col">{children}</div>
    </div>
  );
};

export default layout