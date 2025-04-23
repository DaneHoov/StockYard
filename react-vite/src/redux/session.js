const SET_USER = "session/setUser";
const REMOVE_USER = "session/removeUser";
const SET_WATCHLISTS = "session/SET_WATCHLISTS";
const ADD_WATCHLIST = "session/ADD_WATCHLIST";
const REMOVE_WATCHLIST = "session/REMOVE_WATCHLIST";
const SET_WATCHLIST = "session/SET_WATCHLIST";
const ADD_TO_WATCHLIST = "session/addToWatchlist";
const REMOVE_FROM_WATCHLIST = "session/removeFromWatchlist";
const ADD_TO_PORTFOLIO = "session/addToPortfolio";
const REMOVE_FROM_PORTFOLIO = "session/removeFromPortfolio";
const SET_PORTFOLIOS = "session/SET_PORTFOLIOS";
const ADD_PORTFOLIO = "session/ADD_PORTFOLIO";
const REMOVE_PORTFOLIO = "session/REMOVE_PORTFOLIO";
const SET_PORTFOLIO = "session/SET_PORTFOLIO";

const setUser = (user) => ({
    type: SET_USER,
    payload: user,
});

export const setWatchlists = (watchlists) => ({
    type: SET_WATCHLISTS,
    watchlists,
});

export const addWatchlist = (watchlist) => ({
    type: ADD_WATCHLIST,
    watchlist,
});

export const removeWatchlist = (watchlistId) => ({
    type: REMOVE_WATCHLIST,
    watchlistId,
});

const removeUser = () => ({
    type: REMOVE_USER,
});

const setWatchlist = (watchlist) => ({
    type: SET_WATCHLIST,
    payload: watchlist,
});

const addToWatchlist = (stock) => ({
    type: ADD_TO_WATCHLIST,
    payload: stock,
});
const removeFromWatchlist = (stock) => ({
    type: REMOVE_FROM_WATCHLIST,
    payload: stock,
});

export const setPortfolios = (portfolios) => ({
    type: SET_PORTFOLIOS,
    portfolios,
});


export const addPortfolio = (portfolio) => ({
    type: ADD_PORTFOLIO,
    portfolio,
});


export const removePortfolio = (portfolioId) => ({
    type: REMOVE_PORTFOLIO,
    portfolioId,
});

export const setPortfolio = (portfolio) => ({
    type: SET_PORTFOLIO,
    payload: portfolio,
});



export const thunkAuthenticate = () => async (dispatch) => {
    const response = await fetch("/api/auth/");
    if (response.ok) {
        const data = await response.json();
        if (data.errors) {
            console.error("Authentication errors:", data.errors); // Debugging log
            return;
        }

        // Only set the user if valid credentials exist
        if (data.id) {
            dispatch(setUser(data));
        }
    }
};
export const thunkLogin =
    ({ email, password }) =>
    async (dispatch) => {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            dispatch(setUser(data));
        } else if (response.status < 500) {
            const errorMessages = await response.json();
            console.error("Login errors:", errorMessages); // Debugging log
            return errorMessages;
        } else {
            return { server: "Something went wrong. Please try again" };
        }
    };

export const thunkSignup = (user) => async (dispatch) => {
    const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
    });

    if (response.ok) {
        const data = await response.json();
        dispatch(setUser(data));
    } else if (response.status < 500) {
        const errorMessages = await response.json();
        return errorMessages;
    } else {
        return { server: "Something went wrong. Please try again" };
    }
};

export const thunkLogout = () => async (dispatch) => {
    await fetch("/api/auth/logout", {
        method: "POST",
    });
    dispatch(removeUser());
};

export const thunkCreateWatchlist = (name) => async (dispatch) => {
    const response = await fetch("/api/watchlist/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
    });

    if (response.ok) {
        const newWatchlist = await response.json();
        dispatch(addWatchlist(newWatchlist));
        return newWatchlist;
    } else {
        const error = await response.json();
        alert(error.error || "Failed to create watchlist.");
    }
};

export const thunkDeleteWatchlist = (watchlistId) => async (dispatch) => {
    const response = await fetch(`/api/watchlist/${watchlistId}`, {
        method: "DELETE",
        credentials: "include",
    });

    if (response.ok) {
        dispatch(removeWatchlist(watchlistId));
    } else {
        const error = await response.json();
        alert(error.error || "Failed to delete watchlist.");
    }
};

export const thunkFetchWatchlists = () => async (dispatch) => {
    const response = await fetch("/api/watchlist", {
        method: "GET",
        credentials: "include",
    });

    if (response.ok) {
        const watchlists = await response.json();
        dispatch(setWatchlists(watchlists));
    } else {
        console.error("Failed to fetch watchlists");
    }
};

export const fetchWatchlist = () => async (dispatch, getState) => {
    const { user } = getState().session;
    if (!user) return;

    const response = await fetch("/api/watchlist");
    if (response.ok) {
        const data = await response.json();
        dispatch(setWatchlist(data));
    } else {
        console.error("Failed to fetch watchlist");
    }
};

export const thunkAddToWatchlist = (stock) => async (dispatch, getState) => {
    const { user } = getState().session;
    if (!user) return;

    if (!stock.id) {
        const response = await fetch(`/api/stocks/${stock.symbol}`);
        if (response.ok) {
            const data = await response.json();
            stock.id = data.id;
        } else if (response.status === 404) {
            console.error("Stock not found");
            alert("Failed to add to watchlist: Stock not found.");
            return;
        } else {
            console.error("Failed to fetch stock ID");
            alert("Failed to add to watchlist: Unable to fetch stock ID.");
            return;
        }
    }

    const response = await fetch("/api/stocks/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock_id: stock.id }),
    });
    if (response.ok) {
        const data = await response.json();
        dispatch(addToWatchlist(stock));
        alert(data.message);
    } else {
        const error = await response.json();
        alert(error.error || "Failed to add to watchlist.");
    }
};

export const thunkRemoveFromWatchlist =
    (stockId) => async (dispatch, getState) => {
        if (!stockId) {
            console.error("Missing stock ID for removal!");
            return;
        }

        console.log("Removing stock with ID:", stockId); // Debugging log
        const { user } = getState().session;
        if (!user) return;

        const response = await fetch(`/api/stocks/watchlist/${stockId}`, {
            method: "DELETE",
        });
        if (response.ok) {
            dispatch(removeFromWatchlist(stockId));
        } else {
            const error = await response.json();
            console.error("Failed to remove from watchlist:", error);
            throw new Error(error.error || "Failed to remove from watchlist.");
        }
    };

    export const thunkCreatePortfolio = (name) => async (dispatch) => {
        const response = await fetch("/api/portfolio/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name }),
        });

        if (response.ok) {
            const newPortfolio = await response.json();
            dispatch(addPortfolio(newPortfolio));
            return newPortfolio;
        } else {
            const error = await response.json();
            alert(error.error || "Failed to create portfolio.");
        }
    };

    export const thunkDeletePortfolio = (portfolioId) => async (dispatch) => {
    const response = await fetch(`/api/portfolio/${portfolioId}`, {
        method: "DELETE",
        credentials: "include",
    });

    if (response.ok) {
        dispatch(removePortfolio(portfolioId));
    } else {
        const error = await response.json();
        alert(error.error || "Failed to delete portfolio.");
    }
};
export const thunkFetchPortfolios = () => async (dispatch) => {
    const response = await fetch("/api/portfolio", {
        method: "GET",
        credentials: "include",
    });

    if (response.ok) {
        const portfolios = await response.json();
        dispatch(setPortfolios(portfolios));
    } else {
        console.error("Failed to fetch portfolios");
    }
};
export const fetchPortfolio = () => async (dispatch, getState) => {
    const { user } = getState().session;
    if (!user) return;

    const response = await fetch("/api/portfolio");
    if (response.ok) {
        const data = await response.json();
        dispatch(setPortfolio(data));
    } else {
        console.error("Failed to fetch portfolio");
    }
};



    export const thunkAddToPortfolio = (stock) => async (dispatch, getState) => {
        const { user } = getState().session;
        if (!user) return;

        if (!stock.id) {
            const response = await fetch(`/api/stocks/${stock.symbol}`);
            if (response.ok) {
                const data = await response.json();
                stock.id = data.id;
            } else if (response.status === 404) {
                console.error("Stock not found");
                alert("Failed to add to portfolio: Stock not found.");
                return;
            } else {
                console.error("Failed to fetch stock ID");
                alert("Failed to add to portfolio: Unable to fetch stock ID.");
                return;
            }
        }

        const response = await fetch("/api/stocks/portfolio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stock_id: stock.id, quantity: stock.quantity || 1 }),
        });

        if (response.ok) {
            const data = await response.json();
            dispatch(fetchPortfolio()); // or dispatch(setPortfolio(data)) depending on your slice
            alert(data.message || "Added to portfolio successfully!");
        } else {
            const error = await response.json();
            alert(error.error || "Failed to add to portfolio.");
        }
    };


    export const thunkRemoveFromPortfolio =
    (stockId) => async (dispatch, getState) => {
        if (!stockId) {
            console.error("Missing stock ID for removal!");
            return;
        }

        const { user } = getState().session;
        if (!user) return;

        const response = await fetch(`/api/stocks/portfolio/${stockId}`, {
            method: "DELETE",
        });

        if (response.ok) {
            dispatch(removeFromPortfolio(stockId));
        } else {
            const error = await response.json();
            console.error("Failed to remove from portfolio:", error);
            throw new Error(error.error || "Failed to remove from portfolio.");
        }
    };


const sessionInitialState = {
    user: null,
    watchlist: [],
    portfolio: [],
    portfolios: [],
    watchlists: [],
};

function sessionReducer(state = sessionInitialState, action) {
    switch (action.type) {
        case SET_USER:
            return { ...state, user: action.payload };
        case REMOVE_USER:
            return { ...state, user: null, watchlist: [], portfolio: [] };
        case SET_WATCHLIST:
            return {
                ...state,
                watchlist: action.payload,
            };
        case ADD_TO_WATCHLIST:
            return {
                ...state,
                watchlist: [...state.watchlist, action.payload],
            };
        case REMOVE_FROM_WATCHLIST:
            return {
                ...state,
                watchlist: state.watchlist.filter(
                    (stock) => stock.id !== action.payload
                ),
            };
        case SET_WATCHLISTS:
            return { ...state, watchlists: action.watchlists };
        case ADD_WATCHLIST:
            return {
                ...state,
                watchlists: [...state.watchlists, action.watchlist],
            };
        case REMOVE_WATCHLIST:
            return {
                ...state,
                watchlists: state.watchlists.filter(
                    (watchlist) => watchlist.id !== action.watchlistId
                ),
            };
            case SET_PORTFOLIO:
            return {
                ...state,
                portfolio: action.payload,
            };
        case ADD_TO_PORTFOLIO:
            return {
                ...state,
                portfolio: [...state.portfolio, action.payload],
            };
        case REMOVE_FROM_PORTFOLIO:
            return {
                ...state,
                portfolio: state.portfolio.filter(
                    (stock) => stock.symbol !== action.payload
                ),
            };
            case SET_PORTFOLIOS:
            return {
                ...state,
                portfolios: action.portfolios,
            };
            case ADD_PORTFOLIO:
            return {
                ...state,
                portfolios: [...state.portfolios, action.portfolio],
            };
            case REMOVE_PORTFOLIO:
            return {
                ...state,
                portfolios: state.portfolios.filter(
                    (p) => p.id !== action.portfolioId
                ),
            };
        default:
            return state;
    }
}

export { sessionReducer };
