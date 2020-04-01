import React, { Component } from 'react';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';

interface Props {
    pages: number;
    current: number;
    disabled: boolean;
    onClick?: Function;
}

interface State {
    current: number;
}

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (v, k) => k + a);

class Paginator extends Component<Props, State> {
    public static defaultProps = {
        current: 1,
        disabled: false,
    };
    public state = {
        current: this.props.current,
    };
    public render() {
        return (
            <Pagination>
                <PaginationItem disabled={this.props.disabled}>
                    <PaginationLink first onClick={() => this.onClick(1)} />
                </PaginationItem>
                <PaginationItem disabled={this.props.disabled || this.state.current === 1}>
                    <PaginationLink previous onClick={() => this.onClick(this.state.current - 1)} />
                </PaginationItem>
                {this.renderRangeItems(this.state.current - 2, this.state.current + 2)}
                <PaginationItem
                    disabled={this.props.disabled || this.state.current === this.props.pages}>
                    <PaginationLink next onClick={() => this.onClick(this.state.current + 1)} />
                </PaginationItem>
                <PaginationItem disabled={this.props.disabled}>
                    <PaginationLink last onClick={() => this.onClick(this.props.pages)} />
                </PaginationItem>
            </Pagination>
        );
    }
    private onClick(page: number) {
        if (page < 1 || page > this.props.pages) {
            return;
        }

        if (this.props.onClick !== undefined) {
            this.props.onClick(page);
        }

        this.setState({
            current: page,
        });
    }
    private renderRangeItems(start: number, end: number) {
        if (this.props.pages < 5) {
            start = 1;
            end = this.props.pages;
        } else {
            if (start < 1) {
                end += 1 - start;
                start = 1;
            } else if (end > this.props.pages) {
                start += this.props.pages - end;
                end = this.props.pages;
            }
        }

        return range(start, end).map(index => (
            <PaginationItem
                key={index}
                active={index === this.state.current}
                disabled={this.props.disabled}>
                <PaginationLink onClick={() => this.onClick(index)}>{index}</PaginationLink>
            </PaginationItem>
        ));
    }
}

export default Paginator;
