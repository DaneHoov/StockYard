import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./SearchResults.css";

function SearchResults() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const query = searchParams.get("q");

  useEffect(() => {
    if (query) {
      setLoading(true);
      fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch search results");
          }
          return res.json();
        })
        .then((data) => {
          setResults(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [query]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="search-results-container">
      <h1>Search Results for &quot;{query}&quot;</h1>
      {results.length > 0 ? (
        <table className="results-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {results.map((stock) => (
              <tr key={stock.id}>
                <td>{stock.ticker}</td>
                <td>{stock.name}</td>
                <td>${stock.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
}

export default SearchResults;
