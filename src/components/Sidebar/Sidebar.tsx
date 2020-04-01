import React, { Component } from 'react';
import { NavLink, RouteProps } from 'react-router-dom';
import { Nav } from 'reactstrap';
import PerfectScrollbar from 'perfect-scrollbar';

import { Route } from '../../routes';

let ps: PerfectScrollbar;

interface Props {
    location: RouteProps['location'];
    routes: Array<Route>;
}

class Sidebar extends Component<Props> {
    private sidebar: React.RefObject<HTMLDivElement> = React.createRef();
    public componentDidMount() {
        if (this.sidebar.current !== null && navigator.platform.indexOf('Win') > -1) {
            ps = new PerfectScrollbar(this.sidebar.current, {
                suppressScrollX: true,
                suppressScrollY: false,
            });
        }
    }
    public componentWillUnmount() {
        if (navigator.platform.indexOf('Win') > -1) {
            ps.destroy();
        }
    }
    public render() {
        return (
            <div className='sidebar' data-color='white' data-active-color='info'>
                <div className='logo'>
                    <span className='simple-text'>Coronastone Dashboard</span>
                </div>
                <div className='sidebar-wrapper' ref={this.sidebar}>
                    <Nav>
                        {this.props.routes.map((prop, key) => {
                            return (
                                <li className={this.activeRoute(prop.path)} key={key}>
                                    <NavLink
                                        to={prop.layout + prop.path}
                                        className='nav-link'
                                        activeClassName='active'>
                                        <i className={prop.icon} />
                                        <p>{prop.name}</p>
                                    </NavLink>
                                </li>
                            );
                        })}
                    </Nav>
                </div>
            </div>
        );
    }
    private activeRoute(routeName: string) {
        if (this.props.location !== undefined) {
            return this.props.location.pathname.indexOf(routeName) > -1 ? 'active' : '';
        }
    }
}

export default Sidebar;
