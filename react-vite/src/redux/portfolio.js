const SET_PORTFOLIO = "portfolio/setPortfolio";
const REMOVE_PORTFOLIO = "portfolio/removePortfolio";

const setPortfolio = (portfolio) => ({
    type: SET_PORTFOLIO,
    payload: portfolio,
});

const removePortfolio = (userId) => ({
    type: REMOVE_PORTFOLIO,
    userId,
});

export const getPortfolioThunk = (userId) => async (dispatch) => {
    const res = await fetch(`/api/portfolio/${userId}`);
    if (res.ok) {
        const data = await res.json();
        dispatch(setPortfolio(data));
        return data;
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
        console.error("❌ Portfolio creation error:", error);
        return error;
    }
};

export const addStockToPortfolioThunk = (userId, stock) => async (dispatch) => {
    const res = await fetch(`/api/portfolio/${userId}/stocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stock),
    });

    if (res.ok) {
        const updatedPortfolio = await res.json();
        dispatch(setPortfolio(updatedPortfolio));
        return updatedPortfolio;
    } else {
        const error = await res.json();
        console.error("❌ Portfolio add error:", error);
        return error;
    }
};

export const updatePortfolioThunk =
    (userId, updateData) => async (dispatch) => {
        const res = await fetch(`/api/portfolio/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData),
        });

        if (res.ok) {
            const data = await res.json();
            dispatch(setPortfolio(data));
            return data;
        }
    };

export const deletePortfolioThunk = (userId) => async (dispatch) => {
    const res = await fetch(`/api/portfolio/${userId}`, {
        method: "DELETE",
    });

    if (res.ok) {
        dispatch(removePortfolio(userId));
    }
};

const initialState = {};

export default function portfolioReducer(state = initialState, action) {
    switch (action.type) {
        case SET_PORTFOLIO:
            return { ...state, [action.payload.user_id]: action.payload };
        case REMOVE_PORTFOLIO: {
            const newState = { ...state };
            delete newState[action.userId];
            return newState;
        }
        default:
            return state;
    }
}
