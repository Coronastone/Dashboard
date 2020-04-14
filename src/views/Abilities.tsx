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
    Spinner,
} from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';

import { Ability } from '../models';
import Paginator from '../components/Paginator/Paginator';
import { deleteAsync, getAsync, putAsync, postAsync } from '../api';

interface Props {}

interface State {
    current_page: number;
    current?: Ability;
    data: Array<Ability>;
    modal: boolean;
    pages: number;
    q: string;
}

class Abilities extends Component<Props, State> {
    public state = {
        current_page: 1,
        current: {} as Ability,
        data: new Array<Ability>(),
        modal: false,
        pages: 1,
        q: '',
    };
    private cancellation = new AbortController();
    private unmounted = false;
    public constructor(props: Readonly<Props>) {
        super(props);
    }
    public componentDidMount() {
        this.fetchDataAsync();
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
                                    <tbody>
                                        {this.state.data.map((ability, index) =>
                                            this.renderRow(ability, index)
                                        )}
                                    </tbody>
                                </Table>
                            </CardBody>
                            <CardFooter>
                                <Paginator
                                    pages={this.state.pages}
                                    current={this.state.current_page}
                                    onClick={page => {
                                        this.fetchDataAsync(page);
                                    }}
                                />
                            </CardFooter>
                        </Card>
                    </Col>
                </Row>
                <Modal isOpen={this.state.modal}>
                    <ModalHeader toggle={() => this.toggleModal()}>Edit Ability</ModalHeader>
                    <ModalBody>
                        <Form>
                            <FormGroup row>
                                <Label sm={2}>Name</Label>
                                <Col sm={10}>
                                    <Input
                                        type='text'
                                        name='name'
                                        value={this.state.current?.name}
                                        disabled={this.state.current?.built_in}
                                        onChange={event =>
                                            this.editAbility(event.target.value, 'name')
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
                                            this.editAbility(event.target.value, 'title')
                                        }
                                        placeholder='Leave blank if you don&rsquo;t want to change it'
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
                            {this.state.current?.loading === true ? (
                                <Spinner size='sm' />
                            ) : (
                                'Submit'
                            )}
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
            index = this.state.data.push({} as Ability);
            this.setState({
                data: this.state.data,
            });
        }
        const current = { ...this.state.data[index] };
        this.setState({ current }, () => this.toggleModal());
    }
    private editAbility(value: string, key: 'name' | 'title') {
        const { current } = this.state;
        current[key] = value;
        this.setState({ current });
    }
    private async editAsync() {
        const { current } = this.state;
        if (current !== undefined) {
            current.loading = true;
            this.setState({ current });

            try {
                if (current.id === undefined) {
                    const { id, created_at } = await postAsync(
                        `/api/admin/abilities`,
                        current,
                        this.cancellation.signal
                    );

                    current.id = id;
                    current.created_at = created_at;
                    current.loading = true;

                    this.setState({
                        data: this.state.data.map(ability => {
                            if (ability.id === undefined) {
                                ability = current;
                            }

                            return ability;
                        }),
                    });
                } else {
                    await putAsync(
                        `/api/admin/abilities/${current.id}`,
                        current,
                        this.cancellation.signal
                    );

                    current.loading = false;

                    this.setState({
                        data: this.state.data.map(ability => {
                            if (ability.id === current.id) {
                                ability = current;
                            }

                            return ability;
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
        this.setState({
            data: this.state.data.map(ability => {
                if (ability.id === id) {
                    ability.loading = true;
                }

                return ability;
            }),
        });

        try {
            await deleteAsync(`/api/admin/abilities/${id}`, this.cancellation.signal);

            this.setState({
                data: this.state.data.filter(ability => {
                    return ability.id !== id;
                }),
            });
        } catch {
            toast.error('Cannot delete the ability.');

            this.setState({
                data: this.state.data.map(ability => {
                    if (ability.id === id) {
                        ability.loading = false;
                    }

                    return ability;
                }),
            });
        }
    }
    private async fetchDataAsync(page: number = 1) {
        try {
            this.setState(
                await getAsync(
                    `/api/admin/abilities?q=${this.state.q}&page=${page}`,
                    this.cancellation.signal
                )
            );
        } catch {
            toast.error('Cannot fetch data.');
        }
    }
    private renderRow(ability: Ability, index: number) {
        return (
            <tr key={ability.id}>
                <td>{ability.created_at}</td>
                <td>{ability.name}</td>
                <td>{ability.title}</td>
                <td>
                    <Button color='primary' size='sm' onClick={() => this.edit(index)}>
                        <i className='fas fa-edit'></i>
                    </Button>{' '}
                    {ability.built_in ? null : (
                        <Button
                            color='danger'
                            size='sm'
                            onClick={() => this.deleteAsync(ability.id)}>
                            {ability.loading === true ? (
                                <Spinner size='sm' />
                            ) : (
                                <i className='fas fa-times'></i>
                            )}
                        </Button>
                    )}
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
                data: this.state.data.filter(
                    ability => ability !== undefined && ability.id !== undefined
                ),
            });
        }

        this.setState({ modal });
    }
}

export default Abilities;
