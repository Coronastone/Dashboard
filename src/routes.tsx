import { Component } from 'react';

import Dashboard from './views/Dashboard';

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
];

export type { Route };

export default routers;
