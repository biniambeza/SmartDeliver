import React from 'react';
import { Outlet } from 'react-router-dom';
import RoleNavbar from '../components/RoleNavbar';

export default function RoleLayout() {
  return (
    <>
      <RoleNavbar />
      <Outlet />
    </>
  );
}
