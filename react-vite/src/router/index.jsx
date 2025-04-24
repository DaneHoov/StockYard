import { createBrowserRouter } from "react-router-dom";
import Trade from "../components/TradePage/Trade";
import Watchlist from "../components/WatchlistPage/Watchlist";
import Portfolio from "../components/PortfolioPage/Portfolio";
import LoginFormPage from "../components/LoginFormPage";
import SignupFormPage from "../components/SignupFormPage";
import TermsConditions from "../components/TermsConditionsPage/TermsConditions";
import PrivacyPolicy from "../components/PrivacyPolicyPage/PrivacyPolicy";
import Layout from "./Layout";
import WatchlistList from "../components/WatchlistPage/WatchlistList";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: (
          <div className="landing-center">
            <h1>Trading & Investing</h1>
            <p>
              StockYard offers real-time data, powerful tools, and expert
              <br />
              insights to help you make informed decisions. Start building your
              <br />
              financial future today with StockYard.
            </p>
          </div>
        ),
      },
      { path: "/trade", element: <Trade /> },
      { path: "/watchlist", element: <WatchlistList /> },
      {
        path: "/watchlist/:watchlistId",
        element: <Watchlist />,
      },
      { path: "/portfolio", element: <Portfolio /> },
      {
        path: "/login",
        element: <LoginFormPage />,
      },
      {
        path: "/signup",
        element: <SignupFormPage />,
      },
      {
        path: "/terms",
        element: <TermsConditions />,
      },
      {
        path: "/privacy",
        element: <PrivacyPolicy />,
      },
    ],
  },
]);
