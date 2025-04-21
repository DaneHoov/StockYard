const SET_USER = "session/setUser";
const REMOVE_USER = "session/removeUser";
const SET_WATCHLIST = "session/SET_WATCHLIST";
const ADD_TO_WATCHLIST = "session/addToWatchlist";
const REMOVE_FROM_WATCHLIST = "session/removeFromWatchlist";
const ADD_TO_PORTFOLIO = "session/addToPortfolio";
const REMOVE_FROM_PORTFOLIO = "session/removeFromPortfolio";

const setUser = (user) => ({
    type: SET_USER,
    payload: user,
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

const addToPortfolio = (stock) => ({
    type: ADD_TO_PORTFOLIO,
    payload: stock,
});

const removeFromPortfolio = (stockSymbol) => ({
    type: REMOVE_FROM_PORTFOLIO,
    payload: stockSymbol,
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

export const fetchWatchlist = () => async (dispatch, getState) => {
    const { user } = getState().session;
    if (!user) return;

    const response = await fetch("/api/stocks/watchlist");
    if (response.ok) {
        const data = await response.json();
        dispatch(setWatchlist(data)); // Update the Redux state with the fetched watchlist
    } else {
        console.error("Failed to fetch watchlist");
    }
};

export const thunkAddToWatchlist = (stock) => async (dispatch, getState) => {
    const { user } = getState().session;
    if (!user) return;

    // Fetch the stock ID if it's missing
    if (!stock.id) {
        const response = await fetch(`/api/stocks/${stock.symbol}`);
        if (response.ok) {
            const data = await response.json();
            stock.id = data.id; // Add the fetched ID to the stock object
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

export const thunkAddToPortfolio = (stock) => async (dispatch, getState) => {
    const { user } = getState().session;
    if (!user) return;

    const response = await fetch("/api/stocks/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stock),
    });
    if (response.ok) {
        dispatch(addToPortfolio(stock));
    }
};

export const thunkRemoveFromPortfolio =
    (stockSymbol) => async (dispatch, getState) => {
        const { user } = getState().session;
        if (!user) return;

        const response = await fetch(`/api/stocks/portfolio/${stockSymbol}`, {
            method: "DELETE",
        });
        if (response.ok) {
            dispatch(removeFromPortfolio(stockSymbol));
        }
    };

const sessionInitialState = { user: null, watchlist: [], portfolio: [] };

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
        default:
            return state;
    }
}

export { sessionReducer };
