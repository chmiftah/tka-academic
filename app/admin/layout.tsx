import React from 'react';
import AdminLayoutClient from './AdminLayoutClient';

export const metadata = {
    title: 'TKA Admin Dashboard',
    description: 'Admin Management Area',
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminLayoutClient>
            {children}
        </AdminLayoutClient>
    );
}
