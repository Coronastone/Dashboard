import React, { Component } from 'react';
import {
    Card,
    CardBody,
    Table,
    Row,
    Col,
    CardFooter,
    Badge,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormGroup,
    Form,
    Label,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    CardHeader,
} from 'reactstrap';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';

import { User, Role } from '../models';
import Paginator from '../components/Paginator/Paginator';
import { deleteAsync, getAsync, putAsync, postAsync } from '../api';

interface Props {}

interface State {
    current_page: number;
    current?: User;
    data: Array<User>;
    modal: boolean;
    pages: number;
    q: string;
    trashed: boolean;
    roles: Array<Role>;
}

class Users extends Component<Props, State> {
    public state = {
        current_page: 1,
        current: {} as User,
        data: new Array<User>(),
        modal: false,
        pages: 1,
        q: '',
        trashed: false,
        roles: new Array<Role>(),
    };
    private cancellation = new AbortController();
    private unmounted = false;
    public constructor(props: Readonly<Props>) {
        super(props);
    }
    public componentDidMount() {
        this.fetchDataAsync();
        this.fetchRolesAsync();
    }
    public componentWillUnmount() {
        this.cancellation.abort();
        this.unmounted = true;
    }
    public render() {
        return (
            <div className='content'>
                <ToastContainer autoClose={3000} />
                <Row>
                    <Col md='12'>
                        <Card>
                            <CardHeader>
                                <Button color='success' size='sm' onClick={() => this.edit(-1)}>
                                    New
                                </Button>
                                <Button
                                    color='warning'
                                    size='sm'
                                    onClick={() => {
                                        this.setState({ trashed: !this.state.trashed }, () =>
                                            this.fetchDataAsync()
                                        );
                                    }}
                                    active={this.state.trashed}>
                                    <i
                                        className={
                                            this.state.trashed
                                                ? 'fas fa-check-square'
                                                : 'fas fa-square'
                                        }></i>{' '}
                                    Trashed
                                </Button>
                            </CardHeader>
                            <CardBody>
                                <InputGroup>
                                    <Input
                                        placeholder='Search...'
                                        value={this.state.q}
                                        onChange={event => this.searchAsync(event.target.value)}
                                    />
                                    <InputGroupAddon addonType='append'>
                                        <InputGroupText className='fas fa-search' />
                                    </InputGroupAddon>
                                </InputGroup>
                            </CardBody>
                            <CardBody>
                                <Table>
                                    <thead className='text-primary'>
                                        <tr>
                                            <th>Created At</th>
                                            <th>Username</th>
                                            <th>Name</th>
                                            <th>Roles</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.data.map((user: User, index: number) =>
                                            this.renderRow(user, index)
                                        )}
                                    </tbody>
                                </Table>
                            </CardBody>
                            <CardFooter>
                                <Paginator
                                    pages={this.state.pages}
                                    current={this.state.current_page}
                                    onClick={(page: number) => {
                                        this.fetchDataAsync(page);
                                    }}
                                />
                            </CardFooter>
                        </Card>
                    </Col>
                </Row>
                <Modal isOpen={this.state.modal}>
                    <ModalHeader toggle={() => this.toggleModal()}>Edit User</ModalHeader>
                    <ModalBody>
                        <Form>
                            <FormGroup row>
                                <Label sm={2}>Name</Label>
                                <Col sm={10}>
                                    <Input
                                        type='text'
                                        name='name'
                                        value={this.state.current?.name}
                                        onChange={event =>
                                            this.editUser(event.target.value, 'name')
                                        }
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label sm={2}>Password</Label>
                                <Col sm={10}>
                                    <Input
                                        type='password'
                                        name='password'
                                        value={this.state.current?.password}
                                        onChange={event =>
                                            this.editUser(event.target.value, 'password')
                                        }
                                        placeholder='Leave blank if you don&rsquo;t want to change it'
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label sm={2}>Roles</Label>
                                <Col sm={10}>
                                    <Select
                                        value={this.state.current?.roles}
                                        isMulti={true}
                                        isSearchable={true}
                                        options={this.state.roles}
                                        getOptionLabel={option => option.title}
                                        getOptionValue={option => option.name}
                                        onChange={(value, meta) => this.editRoles(value, meta)}
                                    />
                                </Col>
                            </FormGroup>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button color='secondary' onClick={() => this.toggleModal()}>
                            Cancel
                        </Button>{' '}
                        <Button color='primary' onClick={() => this.editAsync()}>
                            Submit
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
    public setState(state: any, callback?: () => void) {
        if (this.unmounted) return;
        super.setState(state, callback);
    }
    private edit(index: number) {
        if (index < 0) {
            const user = {} as User;
            user.roles = [];
            index = this.state.data.push(user);
            this.setState({
                data: this.state.data,
            });
        }
        const current = { ...this.state.data[index] };
        this.setState({ current }, () => this.toggleModal());
    }
    private editRoles(value: any, meta: any) {
        const { action } = meta;
        const { current } = this.state;
        switch (action) {
            case 'clear':
                current.roles = [];
                break;
            case 'remove-value':
                const { removedValue } = meta;

                current.roles = current.roles.filter(role => {
                    return role.name !== removedValue.name;
                });
                break;
            case 'select-option':
                current.roles = value;
                break;
            default:
                return;
        }

        this.setState({ current });
    }
    private editUser(value: string, key: 'name' | 'password') {
        const { current } = this.state;
        current[key] = value;
        this.setState({ current });
    }
    private async editAsync() {
        const { current } = this.state;
        if (current !== undefined) {
            try {
                if (current.id === undefined) {
                    const { id, username, created_at } = await postAsync(
                        `/api/admin/users`,
                        current,
                        this.cancellation.signal
                    );

                    current.id = id;
                    current.username = username;
                    current.created_at = created_at;

                    this.setState({
                        data: this.state.data.map(user => {
                            if (user.id === undefined) {
                                user = current;
                            }

                            return user;
                        }),
                    });
                } else {
                    await putAsync(
                        `/api/admin/users/${current.id}`,
                        current,
                        this.cancellation.signal
                    );

                    this.setState({
                        data: this.state.data.map(user => {
                            if (user.id === current.id) {
                                user = current;
                            }

                            return user;
                        }),
                    });
                }

                this.setState({
                    current: undefined,
                });
            } catch {
                toast.error('Cannot save your changes.');
            }
        }

        this.toggleModal();
    }
    private async deleteAsync(id: number, destroy: boolean) {
        try {
            await deleteAsync(
                `/api/admin/users/${id}?destroy=${destroy}`,
                this.cancellation.signal
            );

            this.setState({
                data: this.state.data.filter((user: User) => {
                    return user.id !== id;
                }),
            });
        } catch {
            toast.error('Cannot delete the user.');
        }
    }
    private async fetchDataAsync(page: number = 1) {
        const { trashed, q } = this.state;

        try {
            const data = await getAsync(
                `/api/admin/users?trashed=${trashed}&q=${q}&page=${page}`,
                this.cancellation.signal
            );

            this.setState(data);
        } catch {
            toast.error('Cannot fetch data.');
        }
    }
    private async fetchRolesAsync() {
        try {
            const roles = await getAsync('/api/admin/roles', this.cancellation.signal);

            this.setState({ roles });
        } catch {
            toast.error('Cannot fetch data.');
        }
    }
    private renderRow(user: User, index: number) {
        return (
            <tr key={user.id}>
                <td>{user.created_at}</td>
                <td>{user.username}</td>
                <td>{user.name}</td>
                <td>
                    {user.roles.map((role: Role) => (
                        <Badge key={role.id} color='info'>
                            {role.title}
                        </Badge>
                    ))}
                </td>
                <td>
                    <Button color='primary' size='sm' onClick={() => this.edit(index)}>
                        <i className='fas fa-edit'></i>
                    </Button>{' '}
                    <Button
                        color={user.deleted_at ? 'danger' : 'warning'}
                        size='sm'
                        onClick={() => this.deleteAsync(user.id, user.deleted_at !== null)}>
                        <i className={user.deleted_at ? 'fas fa-times' : 'fas fa-trash-alt'}></i>
                    </Button>
                </td>
            </tr>
        );
    }
    private async searchAsync(q: string) {
        this.setState({ q }, () => this.fetchDataAsync());
    }
    private toggleModal() {
        const modal = !this.state.modal;

        if (!modal) {
            this.setState({
                data: this.state.data.filter(user => user !== undefined && user.id !== undefined),
            });
        }

        this.setState({ modal });
    }
}

export default Users;
