import PropTypes from "prop-types";
import { Component } from "react";
import { Notify } from "notiflix";
import { BsSearch } from "react-icons/bs";
import { Wrapper, Form, Input, Button } from "./Searchbar.styled";

Notify.init({
    position: "center-top",
    width: "400px",
    fontSize: "18px",
});

export default class Searchbar extends Component {
    state = {
        query: "",
    };

    handleQueryChange = (event) => {
        this.setState({ query: event.currentTarget.value.toLowerCase() });
    };

    handleSubmit = (event) => {
        event.preventDefault();

        if (this.state.query.trim() === "") {
            Notify.failure("please enter any query");
            return;
        }

        this.props.onSubmit(this.state.query.trim());
        this.setState({ query: "" });
    };

    render() {
        return (
            <Wrapper>
                <Form onSubmit={this.handleSubmit} id="search-form">
                    <Input
                        type="text"
                        name="searchQuery"
                        autoComplete="off"
                        placeholder="Free Search Images By Name..."
                        value={this.state.query}
                        onChange={this.handleQueryChange}
                    />
                    <Button type="submit">
                        <BsSearch size={27} />
                    </Button>
                </Form>
            </Wrapper>
        );
    }
}

Searchbar.propTypes = {
    onSubmit: PropTypes.func.isRequired,
};
