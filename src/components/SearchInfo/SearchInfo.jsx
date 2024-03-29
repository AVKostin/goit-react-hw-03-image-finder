import PropTypes from "prop-types";
import { Component } from "react";
import { Notify } from "notiflix";
import { fetchPictures } from "../../Services/PixabayApi";
import Modal from "../Modal";
import Button from "../Button";
import ImageGallery from "../ImageGallery";
import { Loading } from "notiflix/build/notiflix-loading-aio";

const Status = {
    IDLE: "idle",
    PENDING: "pending",
    RESOLVED: "resolved",
    REJECTED: "rejected",
};

export default class SearchInfo extends Component {
    static defaultProps = {
        initialPage: 1,
    };
    state = {
        pictures: [],
        largeImage: "",
        tags: "",
        showModal: false,
        status: Status.IDLE,
        page: this.props.initialPage,
    };

    componentDidUpdate = (prevProps) => {
        const prevQuery = prevProps.query;
        const nextQuery = this.props.query;

        if (prevQuery !== nextQuery) {
            this.setState({ status: Status.PENDING, page: 1 }, () => {
                const page = this.state.page;

                fetchPictures(nextQuery, page).then((pictures) => {
                    if (
                        pictures.totalHits !== 0 &&
                        pictures.hits.length !== 0
                    ) {
                        Notify.success(
                            `Hooray! We found ${pictures.totalHits} images.`,
                        );
                    } else {
                        Notify.failure(
                            "Sorry, there are no images matching your search query. Please try again.",
                        );
                    }
                    this.setState({
                        pictures: [...pictures.hits],
                        status: Status.RESOLVED,
                    });
                });
            });
        }
    };

    incrementPage = () => {
        this.setState(
            (prevState) => ({
                page: (prevState.page += 1),
            }),
            () => {
                this.setState({ status: Status.PENDING });

                const nextQuery = this.props.query;

                const page = this.state.page;

                fetchPictures(nextQuery, page)
                    .then((pictures) => {
                        if (
                            pictures.hits.length === 0 &&
                            pictures.totalHits !== 0
                        ) {
                            Notify.info(
                                "We're sorry, but you've reached the end of search results.",
                            );
                        }
                        this.setState((prevState) => ({
                            pictures: [...prevState.pictures, ...pictures.hits],
                            status: Status.RESOLVED,
                        }));
                    })
                    .catch(() => {
                        Notify.info(
                            "We're sorry, but you've reached the end of search results.",
                        );
                    });
            },
        );
    };

    toggleModal = () => {
        this.setState(({ showModal }) => ({
            showModal: !showModal,
        }));
    };

    setInfoForModal = (url, tags) => {
        this.setState({ largeImage: url, tags: tags });
        this.toggleModal();
    };

    render() {
        const { pictures, status, showModal, largeImage, tags } = this.state;

        if (status === "pending") {
            return (
                <>
                    {Loading.hourglass({
                        svgSize: "120px",
                    })}
                    <ImageGallery
                        pictures={pictures}
                        setInfoForModal={this.setInfoForModal}
                    />
                    {pictures.length !== 0 && (
                        <Button incrementPage={this.incrementPage} />
                    )}
                </>
            );
        }

        if (status === "resolved") {
            return (
                <>
                    {Loading.remove()}
                    <ImageGallery
                        pictures={pictures}
                        setInfoForModal={this.setInfoForModal}
                    />
                    {showModal && (
                        <Modal
                            onClose={this.toggleModal}
                            largeImage={largeImage}
                            tags={tags}
                        />
                    )}
                    {pictures.length !== 0 && (
                        <Button incrementPage={this.incrementPage} />
                    )}
                </>
            );
        }
    }
}

SearchInfo.propTypes = {
    query: PropTypes.string.isRequired,
};
