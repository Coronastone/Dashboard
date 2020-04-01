import React, { Component } from 'react';
import PerfectScrollbar from 'perfect-scrollbar';
import { Route, Switch, RouteProps } from 'react-router-dom';
import { Navbar, NavbarBrand, Container, Nav, NavItem, Collapse, Button } from 'reactstrap';

import Protected from '../components/Protected/Protected';
import Sidebar from '../components/Sidebar/Sidebar';

import routes from '../routes';

let ps: PerfectScrollbar;

interface Props {
    location: RouteProps['location'];
}

class Dashboard extends Component<Props> {
    private mainPanel: React.RefObject<HTMLDivElement> = React.createRef();
    public componentDidMount() {
        if (this.mainPanel.current !== null && navigator.platform.indexOf('Win') > -1) {
            ps = new PerfectScrollbar(this.mainPanel.current);
            document.body.classList.toggle('perfect-scrollbar-on');
        }
    }
    public componentWillUnmount() {
        if (navigator.platform.indexOf('Win') > -1) {
            ps.destroy();
            document.body.classList.toggle('perfect-scrollbar-on');
        }
    }
    public componentDidUpdate(e: any) {
        if (
            this.mainPanel.current !== null &&
            document.scrollingElement !== null &&
            e.history.action === 'PUSH'
        ) {
            this.mainPanel.current.scrollTop = 0;
            document.scrollingElement.scrollTop = 0;
        }
    }
    public render() {
        return (
            <Protected className='wrapper'>
                <Sidebar {...this.props} routes={routes} />
                <div className='main-panel' ref={this.mainPanel}>
                    <Navbar
                        color='transparent'
                        expand='lg'
                        className='navbar-absolute fixed-top navbar-transparent'>
                        <Container fluid>
                            <div className='navbar-wrapper'>
                                <NavbarBrand href='/'>{this.getBrand()}</NavbarBrand>
                            </div>
                            <Collapse isOpen={true} navbar className='justify-content-end'>
                                <Nav navbar>
                                    <NavItem>
                                        <Button
                                            color='link'
                                            size='sm'
                                            onClick={() => {
                                                sessionStorage.clear();
                                                window.location.replace('/');
                                            }}>
                                            Logout
                                        </Button>
                                    </NavItem>
                                </Nav>
                            </Collapse>
                        </Container>
                    </Navbar>
                    <Switch>
                        {routes.map((prop, key) => {
                            return (
                                <Route
                                    path={prop.layout + prop.path}
                                    component={prop.component}
                                    key={key}
                                />
                            );
                        })}
                    </Switch>
                </div>
            </Protected>
        );
    }
    private getBrand() {
        let brandName = 'Default';
        routes.map(prop => {
            if (window.location.href.indexOf(prop.layout + prop.path) !== -1) {
                brandName = prop.name;
            }
            return null;
        });
        return brandName;
    }
}

export default Dashboard;
