import * as React from "react";
import {
  Action,
  ActionPanel,
  Detail,
  Icon,
  List,
  showToast,
  getPreferenceValues,
} from "@raycast/api";
import fetch from "node-fetch";

export interface Movie {
  title: string;
  year: string;
  imdbID: string;
  poster: string;
  ratings?: {
    imdb: string;
    rottenTomatoes: string;
    audience: string;
    metacritic: string;
    metacriticUser: string;
  };
  director?: string;
}

export interface MovieDetails extends Movie {
  plot: string;
  cast: string[];
  director: string;
  ratings: {
    imdb: string;
    rottenTomatoes: string;
    audience: string;
    metacritic: string;
    metacriticUser: string;
  };
}

const OMDB_API_KEY = getPreferenceValues<{ apiKey: string }>().apiKey;
const DEBOUNCE_DELAY = 300;

async function fetchFromOMDB(endpoint: string) {
  const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&${endpoint}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.Response !== "True") {
    throw new Error(data.Error || "Failed to fetch data");
  }

  return data;
}

const getRatingIcon = (score: string): string => {
  const numericScore = parseInt(score);
  if (isNaN(numericScore)) return "🤔";
  if (score.includes("%")) return numericScore >= 60 ? "🍅" : "🤢";
  if (score.includes("/")) return numericScore >= 60 ? "🪣" : "🥤";
  return "⭐️";
};

const movieToMarkdown = (details: MovieDetails) => {
  return [
    `# ${details.title} (${details.year})`,
    "",
    '<img src="' +
      details.poster +
      '" width="200" alt="Movie Poster" style="border-radius: 8px; margin: 20px 0;" />',
    "",
    `Directed by ${details.director}`,
    "",
    `### Synopsis`,
    details.plot,
    "",
    `### Cast`,
    ...details.cast.map((actor) => `• ${actor}`),
  ].join("\n");
};

export function MovieDetails({ movie }: { movie: Movie }) {
  const [details, setDetails] = React.useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchDetails() {
      if (!OMDB_API_KEY) {
        setError("Please add your OMDB API key in extension preferences");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(
          `http://www.omdbapi.com/?i=${movie.imdbID}&apikey=${OMDB_API_KEY}`
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch movie details: ${response.statusText}`
          );
        }
        const data = await response.json();
        if (data.Error) {
          throw new Error(data.Error);
        }
        setDetails({
          ...movie,
          plot: data.Plot || "No plot available",
          cast: (data.Actors || "").split(", ").filter(Boolean),
          director: data.Director || "Unknown",
          ratings: {
            imdb:
              data.imdbRating && data.imdbRating !== "N/A"
                ? data.imdbRating
                : "N/A",
            rottenTomatoes:
              data.Ratings?.find(
                (r: { Source: string }) => r.Source === "Rotten Tomatoes"
              )?.Value || "N/A",
            audience:
              data.imdbRating && data.imdbRating !== "N/A"
                ? `${Math.round(parseFloat(data.imdbRating) * 10)}%`
                : "N/A",
            metacritic:
              data.Ratings?.find(
                (r: { Source: string }) => r.Source === "Metacritic"
              )?.Value || "N/A",
            metacriticUser: data.Ratings?.find(
              (r: { Source: string }) => r.Source === "Metacritic"
            )?.Value
              ? `${Math.round(
                  parseFloat(
                    data.Ratings.find(
                      (r: { Source: string }) => r.Source === "Metacritic"
                    )?.Value.replace("/100", "")
                  ) * 0.8
                )}%`
              : "N/A",
          },
        });
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchDetails();
  }, [movie.imdbID]);

  const getMovieUrl = (site: "rt" | "audience" | "metacritic" | "imdb") => {
    if (!details?.title) {
      return "";
    }

    const title = encodeURIComponent(
      details.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, site === "metacritic" ? "-" : "_")
    );
    switch (site) {
      case "rt":
        return `https://www.rottentomatoes.com/m/${title}`;
      case "audience":
        return `https://www.rottentomatoes.com/m/${title}#audience_reviews`;
      case "metacritic":
        return `https://www.metacritic.com/movie/${title}`;
      case "imdb":
        return `https://www.imdb.com/title/${movie.imdbID}`;
    }
  };

  return React.createElement(Detail, {
    markdown: error
      ? `# Error\n\n${error}`
      : details
        ? movieToMarkdown(details)
        : "Loading movie details...",
    isLoading: isLoading,
    metadata: details
      ? React.createElement(Detail.Metadata, null, [
          React.createElement(Detail.Metadata.TagList, {
            key: "tomatoes",
            title: "Rotten Tomatoes",
            children: React.createElement(Detail.Metadata.TagList.Item, {
              text: details.ratings.rottenTomatoes,
              icon: { source: "🍅", tintColor: "red" },
            }),
          }),
          React.createElement(Detail.Metadata.TagList, {
            key: "audience",
            title: "Audience Score",
            children: React.createElement(Detail.Metadata.TagList.Item, {
              text: details.ratings.audience,
              icon: { source: "🍿", tintColor: "yellow" },
            }),
          }),
          React.createElement(Detail.Metadata.Separator, {
            key: "separator2",
          }),
          React.createElement(Detail.Metadata.TagList, {
            key: "metacritic",
            title: "Metacritic",
            children: React.createElement(Detail.Metadata.TagList.Item, {
              text: details.ratings.metacritic,
              icon: { source: "🎯", tintColor: "blue" },
            }),
          }),
          React.createElement(Detail.Metadata.TagList, {
            key: "metacriticUser",
            title: "Metacritic User",
            children: React.createElement(Detail.Metadata.TagList.Item, {
              text: details.ratings.metacriticUser,
              icon: { source: "👥", tintColor: "blue" },
            }),
          }),
          React.createElement(Detail.Metadata.TagList, {
            key: "imdb",
            title: "IMDB",
            children: React.createElement(Detail.Metadata.TagList.Item, {
              text: details.ratings.imdb,
              icon: { source: "⭐️", tintColor: "yellow" },
            }),
          }),
        ])
      : null,
    actions: React.createElement(
      ActionPanel,
      null,
      React.createElement(Action.OpenInBrowser, {
        title: "View on IMDB",
        icon: { source: "⭐️", tintColor: "yellow" },
        url: getMovieUrl("imdb"),
      }),
      React.createElement(Action.OpenInBrowser, {
        title: "View on Rotten Tomatoes",
        icon: { source: "🍅", tintColor: "red" },
        url: getMovieUrl("rt"),
      }),
      React.createElement(Action.OpenInBrowser, {
        title: "View Audience Reviews",
        icon: { source: "🍿", tintColor: "yellow" },
        url: getMovieUrl("audience"),
      }),
      React.createElement(Action.OpenInBrowser, {
        title: "View on Metacritic",
        icon: { source: "🎯", tintColor: "blue" },
        url: getMovieUrl("metacritic"),
      }),
      React.createElement(Action.CopyToClipboard, {
        title: "Copy IMDB URL",
        content: getMovieUrl("imdb"),
      })
    ),
  });
}

function MovieListItem({ movie }: { movie: Movie }) {
  const [details, setDetails] = React.useState<MovieDetails | null>(null);

  React.useEffect(() => {
    async function fetchRatings() {
      if (!OMDB_API_KEY) {
        return;
      }

      try {
        const response = await fetch(
          `http://www.omdbapi.com/?i=${movie.imdbID}&apikey=${OMDB_API_KEY}`
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch movie details: ${response.statusText}`
          );
        }
        const data = await response.json();
        if (data.Error) {
          throw new Error(data.Error);
        }
        setDetails({
          ...movie,
          director: data.Director || "Unknown",
          ratings: {
            imdb:
              data.imdbRating && data.imdbRating !== "N/A"
                ? data.imdbRating
                : "N/A",
            rottenTomatoes:
              data.Ratings?.find(
                (r: { Source: string }) => r.Source === "Rotten Tomatoes"
              )?.Value || "N/A",
            audience:
              data.imdbRating && data.imdbRating !== "N/A"
                ? `${Math.round(parseFloat(data.imdbRating) * 10)}%`
                : "N/A",
            metacritic:
              data.Ratings?.find(
                (r: { Source: string }) => r.Source === "Metacritic"
              )?.Value || "N/A",
            metacriticUser: data.Ratings?.find(
              (r: { Source: string }) => r.Source === "Metacritic"
            )?.Value
              ? `${Math.round(
                  parseFloat(
                    data.Ratings.find(
                      (r: { Source: string }) => r.Source === "Metacritic"
                    )?.Value.replace("/100", "")
                  ) * 0.8
                )}%`
              : "N/A",
          },
        });
      } catch (error) {
        console.error("Failed to fetch ratings:", error);
      }
    }
    fetchRatings();
  }, [movie.imdbID]);

  const accessories = [];

  if (details?.ratings) {
    if (details.ratings.rottenTomatoes !== "N/A") {
      accessories.push({
        text: details.ratings.rottenTomatoes,
        icon: { source: "🍅", tintColor: "red" },
      });
    }
    if (details.ratings.audience !== "N/A") {
      accessories.push({
        text: details.ratings.audience,
        icon: { source: "🍿", tintColor: "yellow" },
      });
    }
    if (details.ratings.metacritic !== "N/A") {
      accessories.push({
        text: details.ratings.metacritic,
        icon: { source: "🎯", tintColor: "blue" },
      });
    }
    if (details.ratings.metacriticUser !== "N/A") {
      accessories.push({
        text: details.ratings.metacriticUser,
        icon: { source: "👥", tintColor: "blue" },
      });
    }
    if (details.ratings.imdb !== "N/A") {
      accessories.push({
        text: details.ratings.imdb,
        icon: { source: "⭐️", tintColor: "yellow" },
      });
    }
  }

  return React.createElement(List.Item, {
    title: `${movie.title} (${movie.year})`,
    accessories: accessories,
    actions: React.createElement(
      ActionPanel,
      null,
      React.createElement(ActionPanel.Section, null, [
        React.createElement(Action.Push, {
          key: "details",
          title: "Show Details",
          target: React.createElement(MovieDetails, { movie }),
        }),
      ])
    ),
  });
}

export default function Command() {
  const [searchText, setSearchText] = React.useState("");
  const [movies, setMovies] = React.useState<Movie[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function performSearch() {
      if (!searchText.trim()) {
        setMovies([]);
        setError(null);
        return;
      }

      if (!OMDB_API_KEY) {
        setError("Please add your OMDB API key in extension preferences");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(
          `http://www.omdbapi.com/?s=${encodeURIComponent(searchText)}&apikey=${OMDB_API_KEY}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch movies: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.Error) {
          if (data.Error === "Movie not found!") {
            setMovies([]);
          } else {
            throw new Error(data.Error);
          }
        } else {
          setMovies(
            data.Search.map((item: any) => ({
              title: item.Title,
              year: item.Year,
              imdbID: item.imdbID,
              poster: item.Poster,
            }))
          );
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    }

    const debounceTimeout = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchText]);

  return React.createElement(List, {
    isLoading: isLoading,
    searchText: searchText,
    onSearchTextChange: setSearchText,
    searchBarPlaceholder: "Search movies by title...",
    throttle: true,
    children: error
      ? React.createElement(List.EmptyView, {
          title: "Error",
          description: error,
          icon: Icon.ExclamationMark,
        })
      : !searchText
        ? React.createElement(List.EmptyView, {
            title: "Type to Search",
            description: "Enter a movie title to start searching",
            icon: Icon.MagnifyingGlass,
          })
        : movies.length === 0
          ? React.createElement(List.EmptyView, {
              title: "No Results",
              description: "Try searching with a different title",
              icon: Icon.QuestionMark,
            })
          : movies.map((movie) =>
              React.createElement(MovieListItem, {
                key: movie.imdbID,
                movie: movie,
              })
            ),
  });
}
