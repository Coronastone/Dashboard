import React, { Component } from 'react';
import {
    Card,
    CardBody,
    Table,
    Row,
    Col,
    CardFooter,
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

import { Ability, Role } from '../models';
import Paginator from '../components/Paginator/Paginator';
import { deleteAsync, getAsync, putAsync, postAsync } from '../api';

interface Props {}

interface State {
    current_page: number;
    current?: Role;
    data: Array<Role>;
    modal: boolean;
    pages: number;
    q: string;
    abilities: Array<Ability>;
}

class Roles extends Component<Props, State> {
    public state = {
        current_page: 1,
        current: {} as Role,
        data: new Array<Role>(),
        modal: false,
        pages: 1,
        q: '',
        abilities: new Array<Ability>(),
    };
    public constructor(props: Readonly<Props>) {
        super(props);
    }
    public componentDidMount() {
        this.fetchDataAsync();
        this.fetchAbilitiesAsync();
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
                                            <th>Name</th>
                                            <th>Title</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>{this.renderRow()}</tbody>
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
                                <Label sm={2}>Title</Label>
                                <Col sm={10}>
                                    <Input
                                        type='text'
                                        name='title'
                                        value={this.state.current?.title}
                                        onChange={event =>
                                            this.editUser(event.target.value, 'title')
                                        }
                                        placeholder='Leave blank if you don&rsquo;t want to change it'
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label sm={2}>Abilities</Label>
                                <Col sm={10}>
                                    <Select
                                        value={this.state.current?.abilities}
                                        isMulti={true}
                                        options={this.state.abilities}
                                        getOptionLabel={option => option.title}
                                        getOptionValue={option => option.name}
                                        onChange={(value, meta) => this.editAbilities(value, meta)}
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
    private edit(index: number) {
        if (index < 0) {
            index = this.state.data.push({} as Role);
            this.setState({
                data: this.state.data,
            });
        }
        const current = { ...this.state.data[index] };
        this.setState({ current }, () => this.toggleModal());
    }
    private editAbilities(value: any, meta: any) {
        const { action } = meta;
        const { current } = this.state;
        switch (action) {
            case 'clear':
                current.abilities = [];
                break;
            case 'remove-value':
                const { removedValue } = meta;

                current.abilities = current.abilities.filter(ability => {
                    return ability.name !== removedValue.name;
                });
                break;
            case 'select-option':
                current.abilities = value;
                break;
            default:
                return;
        }

        this.setState({ current });
    }
    private editUser(value: string, key: 'name' | 'title') {
        const { current } = this.state;
        current[key] = value;
        this.setState({ current });
    }
    private async editAsync() {
        const { current } = this.state;
        if (current !== undefined) {
            try {
                if (current.id === undefined) {
                    const { id, created_at } = await postAsync(`/api/admin/roles`, current);

                    this.setState({
                        data: this.state.data.map(role => {
                            if (role.id === current.id) {
                                current.id = id;
                                current.created_at = created_at;

                                role = current;
                            }

                            return role;
                        }),
                    });
                } else {
                    await putAsync(`/api/admin/roles/${current.id}`, current);

                    this.setState({
                        data: this.state.data.map(role => {
                            if (role.id === current.id) {
                                role = current;
                            }

                            return role;
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
    private async deleteAsync(id: number) {
        try {
            await deleteAsync(`/api/admin/roles/${id}`);

            this.setState({
                data: this.state.data.filter((role: Role) => {
                    return role.id !== id;
                }),
            });
        } catch {
            toast.error('Cannot delete the role.');
        }
    }
    private async fetchDataAsync(page: number = 1) {
        this.setState(await getAsync(`/api/admin/roles?q=${this.state.q}&page=${page}`));
    }
    private async fetchAbilitiesAsync() {
        this.setState({
            abilities: await getAsync('/api/admin/abilities'),
        });
    }
    private renderRow() {
        return this.state.data.map((role: Role, index: number) => (
            <tr key={role.id}>
                <td>{role.created_at}</td>
                <td>{role.name}</td>
                <td>{role.title}</td>
                <td>
                    <Button color='primary' size='sm' onClick={() => this.edit(index)}>
                        <i className='fas fa-edit'></i>
                    </Button>{' '}
                    <Button color='danger' size='sm' onClick={() => this.deleteAsync(role.id)}>
                        <i className='fas fa-times'></i>
                    </Button>
                </td>
            </tr>
        ));
    }
    private async searchAsync(q: string) {
        this.setState({ q }, () => this.fetchDataAsync());
    }
    private toggleModal() {
        const modal = !this.state.modal;

        if (!modal) {
            this.setState({
                data: this.state.data.filter(role => role !== undefined && role.id !== undefined),
            });
        }

        this.setState({ modal });
    }
}

export default Roles;
