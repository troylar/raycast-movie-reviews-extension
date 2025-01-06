/** @jsx React.createElement */
import {
  Action,
  ActionPanel,
  Detail,
  Icon,
  List,
  showToast,
  Toast,
  getPreferenceValues,
} from "@raycast/api";
import React, { ReactElement } from "react";
import fetch from "node-fetch";

interface Movie {
  title: string;
  year: string;
  imdbID: string;
  poster: string;
  rottenTomatoesScore?: string;
  imdbRating?: string;
  plot?: string;
  cast?: string[];
}

interface MovieDetails extends Movie {
  plot: string;
  cast: string[];
  imdbRating: string;
  rottenTomatoesScore: string;
}

interface Preferences {
  apiKey: string;
}

// Get API key from preferences
const preferences = getPreferenceValues<Preferences>();
const OMDB_API_KEY = preferences.apiKey;

interface MovieListItemProps {
  movie: Movie;
}

interface MovieActionsProps {
  movie: Movie;
}

export function MovieListItem({ movie }: MovieListItemProps): ReactElement {
  return React.createElement(List.Item, {
    title: movie.title,
    subtitle: movie.year,
    accessories: [
      { text: movie.rottenTomatoesScore || "N/A", icon: Icon.Star },
      { text: movie.imdbRating || "N/A" },
    ],
    actions: React.createElement(MovieActions, { movie }),
  });
}

export function MovieActions({ movie }: MovieActionsProps): ReactElement {
  const [details, setDetails] = React.useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  async function fetchMovieDetails() {
    setIsLoading(true);
    try {
      const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${movie.imdbID}&plot=full`;
      console.log("Fetching movie details from:", url);
      
      const response = await fetch(url);
      const data = await response.json();
      console.log("Movie details response:", data);
      
      if (data.Response === "True") {
        setDetails({
          ...movie,
          plot: data.Plot || "",
          cast: (data.Actors || "").split(", ").filter(Boolean),
          imdbRating: data.imdbRating || "N/A",
          rottenTomatoesScore:
            data.Ratings?.find((r: any) => r.Source === "Rotten Tomatoes")
              ?.Value || "N/A",
        });
      } else {
        console.log("API Error:", data.Error);
        showToast({
          style: Toast.Style.Failure,
          title: "Failed to fetch movie details",
          message: data.Error || "Please try again",
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to fetch movie details",
        message: "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    fetchMovieDetails();
  }, []);

  if (isLoading || !details) {
    return React.createElement(
      ActionPanel,
      null,
      React.createElement(Action.OpenInBrowser, {
        title: "View on IMDB",
        url: `https://www.imdb.com/title/${movie.imdbID}`,
      })
    );
  }

  const markdown = `
  # ${details.title} (${details.year})

  ![Movie Poster](${movie.poster})

  ## Ratings
  🍅 Rotten Tomatoes: ${details.rottenTomatoesScore}
  ⭐️ IMDB: ${details.imdbRating}

  ## Plot
  ${details.plot}

  ## Cast
  ${details.cast.map((actor) => `- ${actor}`).join("\n")}
  `;

  return React.createElement(ActionPanel, null, [
    React.createElement(Action.Push, {
      key: "details",
      title: "Show Details",
      icon: Icon.Eye,
      target: React.createElement(Detail, { markdown }),
    }),
    React.createElement(Action.OpenInBrowser, {
      key: "imdb",
      title: "View on IMDB",
      url: `https://www.imdb.com/title/${movie.imdbID}`,
    }),
    React.createElement(Action.OpenInBrowser, {
      key: "rotten-tomatoes",
      title: "View on Rotten Tomatoes",
      url: `https://www.rottentomatoes.com/search?search=${encodeURIComponent(details.title)}`,
    }),
  ]);
}

export default function Command(): ReactElement {
  const [searchText, setSearchText] = React.useState("");
  const [movies, setMovies] = React.useState<Movie[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    async function fetchMovies() {
      if (!searchText) {
        setMovies([]);
        return;
      }

      setIsLoading(true);
      try {
        const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(searchText)}&type=movie`;
        console.log("Fetching movies from:", url);
        
        const response = await fetch(url);
        const data = await response.json();
        console.log("API Response:", data);
        
        if (data.Response === "True") {
          const movieResults = data.Search.map((movie: any) => ({
            title: movie.Title,
            year: movie.Year,
            imdbID: movie.imdbID,
            poster: movie.Poster,
          }));
          setMovies(movieResults);
          console.log("Processed movies:", movieResults);
        } else {
          console.log("API Error:", data.Error);
          setMovies([]);
          showToast({
            style: Toast.Style.Failure,
            title: "No movies found",
            message: data.Error || "Try a different search term",
          });
        }
      } catch (error) {
        console.error("Fetch error:", error);
        showToast({
          style: Toast.Style.Failure,
          title: "Failed to fetch movies",
          message: "Please try again",
        });
      } finally {
        setIsLoading(false);
      }
    }

    const debounce = setTimeout(fetchMovies, 300);
    return () => clearTimeout(debounce);
  }, [searchText]);

  return React.createElement(List, {
    isLoading,
    onSearchTextChange: setSearchText,
    searchBarPlaceholder: "Search for movies...",
    throttle: true,
    children: movies.map((movie) =>
      React.createElement(MovieListItem, {
        key: movie.imdbID,
        movie,
      })
    ),
  });
}
