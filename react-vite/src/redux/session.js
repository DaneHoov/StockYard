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
const SET_PORTFOLIO = "session/SET_PORTFOLIO";

const setUser = (user) => ({
    type: SET_USER,
    payload: user,
});

export const setWatchlists = (watchlists) => ({
    type: SET_WATCHLISTS,
    watchlists,
});

const setPortfolio = (portfolio) => ({
    type: SET_PORTFOLIO,
    payload: portfolio,
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

// const addToWatchlist = (stock) => ({
//   type: ADD_TO_WATCHLIST,
//   payload: stock,
// });
// const removeFromWatchlist = (stock) => ({
//   type: REMOVE_FROM_WATCHLIST,
//   payload: stock,
// });

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

export const thunkFetchWatchlist = (watchlistId) => async (dispatch) => {
    const response = await fetch(`/api/watchlist/${watchlistId}`, {
        method: "GET",
        credentials: "include",
    });
    if (response.ok) {
        const data = await response.json();
        dispatch(setWatchlist(data));
    } else {
        console.error("Failed to fetch watchlist");
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

export const thunkAddToWatchlist =
    ({ stockId, watchlistId, ticker }) =>
    async (dispatch, getState) => {
        const { user } = getState().session;
        if (!user) return;

        let resolvedStockId = stockId;

        if (!resolvedStockId && ticker) {
            const response = await fetch(`/api/stocks/${ticker}`);
            if (response.ok) {
                const data = await response.json();
                resolvedStockId = data.id;
            } else {
                alert("Failed to add to watchlist: Stock not found.");
                return;
            }
        }

        if (!resolvedStockId || !watchlistId) {
            alert("Missing stock or watchlist ID.");
            return;
        }

        try {
            const response = await fetch(`/api/watchlist/${watchlistId}/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    stock_id: resolvedStockId,
                }),
            });

            if (response.status === 200 || response.status === 201) {
                const data = await response.json();
                await dispatch(thunkFetchWatchlist(watchlistId));
                alert(data.message || "Stock added to watchlist successfully.");
            } else {
                const error = await response.json();
                console.error("Failed to add to watchlist:", error);
                alert(error.error || "Failed to add to watchlist.");
            }
        } catch (error) {
            console.error("Error adding to watchlist:", error);
            alert("An unexpected error occurred. Please try again.");
        }
    };

export const thunkRemoveFromWatchlist =
    (stockTicker, watchlistId) => async (dispatch) => {
        const response = await fetch(`/api/watchlist/${watchlistId}/remove`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ ticker: stockTicker }),
        });
        if (response.ok) {
            await dispatch(thunkFetchWatchlist(watchlistId)); // Refresh the watchlist
        }
    };
// export const thunkRemoveFromWatchlist =
//   (stockId) => async (dispatch, getState) => {
//     if (!stockId) {
//       console.error("Missing stock ID for removal!");
//       return;
//     }

//     console.log("Removing stock with ID:", stockId); // Debugging log
//     const { user } = getState().session;
//     if (!user) return;

//     const response = await fetch(`/api/stocks/watchlist/${stockId}`, {
//       method: "DELETE",
//     });
//     if (response.ok) {
//       dispatch(removeFromWatchlist(stockId));
//     } else {
//       const error = await response.json();
//       console.error("Failed to remove from watchlist:", error);
//       throw new Error(error.error || "Failed to remove from watchlist.");
//     }
//   };

export const thunkFetchPortfolio = (userId) => async (dispatch) => {
    const response = await fetch(`/api/portfolio/${userId}`);
    if (response.ok) {
        const portfolio = await response.json();
        dispatch(setPortfolio(portfolio));
    } else {
        console.error("Failed to fetch portfolio");
    }
};

export const thunkAddToPortfolio = (stock) => async (dispatch, getState) => {
    const { user } = getState().session;
    if (!user) return;

    // Ensure stock_id is included in the payload
    if (!stock.id) {
        console.error("Missing stock ID for portfolio addition:", stock);
        alert("Failed to add to portfolio: Missing stock ID.");
        return;
    }

    const response = await fetch("/api/stocks/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            stock_id: stock.id,
            quantity: stock.quantity,
        }),
    });

    if (response.ok) {
        dispatch(addToPortfolio(stock));
        alert(
            `${stock.quantity} shares of ${stock.ticker} have been added to your portfolio.`
        );
    } else {
        const error = await response.json();
        console.error("Failed to add to portfolio:", error);
        alert(error.error || "Failed to add to portfolio.");
    }
};

export const createPortfolioThunk = (portfolioData) => async (dispatch) => {
    const res = await fetch(`/api/portfolio/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(portfolioData),
    });

    if (res.ok) {
        const data = await res.json();
        dispatch(setPortfolio(data));
        return data;
    } else {
        const error = await res.json();
        console.error("Failed to create portfolio:", error);
        return error;
    }
};

export const thunkRemoveFromPortfolio =
    ({ ticker, quantity, portfolioId }) =>
    async (dispatch) => {
        try {
            const response = await fetch(
                `/api/stocks/portfolio/${ticker}?portfolio_id=${portfolioId}`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ quantity }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                dispatch(removeFromPortfolio(ticker));
                dispatch(thunkFetchPortfolio(portfolioId));
                alert(data.message || "Stock removed from portfolio.");
            } else {
                const error = await response.json();
                console.error("Failed to remove stock from portfolio:", error);
                throw new Error(
                    error.error || "Failed to remove stock from portfolio."
                );
            }
        } catch (error) {
            console.error("Error in thunkRemoveFromPortfolio:", error);
            throw error;
        }
    };

const sessionInitialState = {
    user: null,
    watchlist: [],
    portfolio: [],
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
        case ADD_TO_PORTFOLIO:
            return {
                ...state,
                portfolio: [...state.portfolio, action.payload],
            };
        case REMOVE_FROM_PORTFOLIO:
            return {
                ...state,
                portfolio: state.portfolio.filter(
                    (stock) => stock.ticker !== action.payload
                ),
            };
        default:
            return state;
    }
}

export { sessionReducer };
