import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import { Router, Route, Switch, Redirect } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.css';
import 'perfect-scrollbar/css/perfect-scrollbar.css';
import 'react-toastify/dist/ReactToastify.css';

import '@fortawesome/fontawesome-free/scss/fontawesome.scss';
import '@fortawesome/fontawesome-free/scss/solid.scss';

import './assets/scss/paper-dashboard.scss?v=1.1.0';

import AdminLayout from './layouts/Admin';

const hist = createBrowserHistory();

ReactDOM.render(
    <Router history={hist}>
        <Switch>
            <Route path='/admin' render={props => <AdminLayout {...props} />} />
            <Redirect to='/admin/dashboard' />
        </Switch>
    </Router>,
    document.getElementById('app')
);
