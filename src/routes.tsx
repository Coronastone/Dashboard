import { Component } from 'react';

import Abilities from './views/Abilities';
import Dashboard from './views/Dashboard';
import Roles from './views/Roles';
import Users from './views/Users';

type Route = {
    path: string;
    name: string;
    icon: string;
    component: typeof Component;
    layout: string;
};

const routers: Array<Route> = [
    {
        path: '/dashboard',
        name: 'Dashboard',
        icon: 'fas fa-tachometer-alt',
        component: Dashboard,
        layout: '/admin',
    },
    {
        path: '/users',
        name: 'Users',
        icon: 'fas fa-user-friends',
        component: Users,
        layout: '/admin',
    },
    {
        path: '/roles',
        name: 'Roles',
        icon: 'fas fa-user-shield',
        component: Roles,
        layout: '/admin',
    },
    {
        path: '/abilities',
        name: 'Abilities',
        icon: 'fas fa-user-tag',
        component: Abilities,
        layout: '/admin',
    },
];

export type { Route };

export default routers;
