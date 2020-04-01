import React, { Component } from 'react';

import config from '../../config';
import { getAsync } from '../../api';

interface Props {
    className: string;
}

interface State {
    authenticated: boolean;
}

class Protected extends Component<Props, State> {
    public state = {
        authenticated: true,
    };
    public async componentDidMount() {
        const hash = window.location.hash;
        if (hash) {
            sessionStorage.setItem('access_token', this.getJsonFromHash(hash));

            window.location.hash = '';
        }

        const token = sessionStorage.getItem('access_token');
        if (!token) {
            this.setState({ authenticated: false });
        }

        try {
            await getAsync('/api/guard');
        } catch {
            sessionStorage.clear();
            this.setState({ authenticated: false });
        }
    }
    public render() {
        if (this.state.authenticated) {
            return <div className={this.props.className}>{this.props.children}</div>;
        } else {
            const { client_id } = config;

            window.location.replace(`/oauth/authorize?response_type=token&client_id=${client_id}`);

            return <div className={this.props.className}></div>;
        }
    }
    private getJsonFromHash(str: string) {
        const query = str.substr(1).split('&');

        for (const i in query) {
            const item = query[i].split('=');

            if (item[0] === 'access_token') return decodeURIComponent(item[1]);
        }

        return '';
    }
}

export default Protected;
