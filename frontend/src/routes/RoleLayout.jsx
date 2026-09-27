import React from 'react';
import { Outlet } from 'react-router-dom';
import RoleNavbar from '../components/RoleNavbar';
import AiSupportDrawer from '../components/AiSupportDrawer';

export default function RoleLayout() {
  return (
    <>
      <RoleNavbar />
      <Outlet />
      <AiSupportDrawer />
    </>
  );
}
