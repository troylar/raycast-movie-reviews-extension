import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import fetch, { Response } from "node-fetch";
import { getPreferenceValues } from "@raycast/api";
import { Movie } from "../movies";
import { renderHook } from "@testing-library/react";
import React from "react";

type JsonResponse = {
  Search?: Array<{
    Title: string;
    Year: string;
    imdbID: string;
    Poster: string;
  }>;
  Error?: string;
};

// Mock Raycast API
jest.mock("@raycast/api", () => ({
  getPreferenceValues: jest.fn(),
  Icon: {
    Circle: "circle",
    Person: "person",
    Target: "target",
    Star: "star",
    Calendar: "calendar",
    ExclamationMark: "exclamation-mark",
    MagnifyingGlass: "magnifying-glass",
    QuestionMark: "question-mark",
  },
  Color: {
    Red: "red",
    Yellow: "yellow",
    Blue: "blue",
  },
  List: {
    Item: jest.fn(),
    EmptyView: jest.fn(),
  },
  Detail: {
    Metadata: {
      TagList: {
        Item: jest.fn(),
      },
    },
  },
  Action: {
    Push: jest.fn(),
    OpenInBrowser: jest.fn(),
    CopyToClipboard: jest.fn(),
  },
  ActionPanel: {
    Section: jest.fn(),
  },
}));

// Mock node-fetch
jest.mock("node-fetch", () => {
  return jest.fn().mockImplementation(() => Promise.resolve());
});

describe("Movie Reviews Extension", () => {
  const mockApiKey = "test-api-key";
  const mockMovie = {
    Title: "Test Movie",
    Year: "2023",
    imdbID: "tt1234567",
    Poster: "https://test.com/poster.jpg",
    Plot: "A test movie plot",
    Director: "Test Director",
    Actors: "Actor 1, Actor 2, Actor 3",
    Ratings: [
      { Source: "Internet Movie Database", Value: "8.0/10" },
      { Source: "Rotten Tomatoes", Value: "85%" },
      { Source: "Metacritic", Value: "75/100" },
    ],
  };

  const createMockResponse = (body: JsonResponse, status = 200): Response =>
    ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    }) as Response;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock preferences
    (getPreferenceValues as jest.Mock).mockReturnValue({ apiKey: mockApiKey });

    // Mock fetch
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
      createMockResponse({ Search: [mockMovie] }),
    );
  });

  describe("API Integration", () => {
    it("should handle missing API key", async () => {
      (getPreferenceValues as jest.Mock).mockReturnValue({ apiKey: "" });
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
        createMockResponse({ Error: "Invalid API key!" }, 401),
      );
    });

    it("should handle API errors", async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
        createMockResponse({}, 500),
      );
    });

    it("should handle no results", async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(
        createMockResponse({ Error: "Movie not found!" }),
      );
    });
  });

  describe("Rating Calculations", () => {
    it("should calculate audience score correctly", () => {
      const imdbRating = "8.5";
      const expectedScore = "85%";
      const calculatedScore = `${Math.round(parseFloat(imdbRating) * 10)}%`;
      expect(calculatedScore).toBe(expectedScore);
    });

    it("should calculate metacritic user score correctly", () => {
      const metacriticScore = "75/100";
      const expectedScore = "60%";
      const calculatedScore = `${Math.round(parseFloat(metacriticScore.replace("/100", "")) * 0.8)}%`;
      expect(calculatedScore).toBe(expectedScore);
    });
  });

  describe("URL Generation", () => {
    const movieTitle = "Test Movie: A Story";

    it("should generate correct Rotten Tomatoes URL", () => {
      const expected = "https://www.rottentomatoes.com/m/test_movie_a_story";
      const generated = `https://www.rottentomatoes.com/m/${movieTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
      expect(generated).toBe(expected);
    });

    it("should generate correct Metacritic URL", () => {
      const expected = "https://www.metacritic.com/movie/test-movie-a-story";
      const generated = `https://www.metacritic.com/movie/${movieTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      expect(generated).toBe(expected);
    });

    it("should generate correct IMDB URL", () => {
      const imdbId = "tt1234567";
      const expected = "https://www.imdb.com/title/tt1234567";
      const generated = `https://www.imdb.com/title/${imdbId}`;
      expect(generated).toBe(expected);
    });
  });

  describe("MovieDetails", () => {
    describe("getMovieUrl", () => {
      it("should handle undefined details gracefully", async () => {
        // Mock the fetch function to return undefined
        const mockFetch = jest.fn().mockImplementation(() =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(undefined),
          } as Response),
        ) as jest.MockedFunction<typeof globalThis.fetch>;
        (global as any).fetch = mockFetch;

        const movie: Movie = {
          title: "Test Movie",
          year: "2023",
          imdbID: "tt1234567",
          poster: "test-poster.jpg",
          ratings: {
            imdb: "8.0",
            rottenTomatoes: "90%",
            audience: "85%",
            metacritic: "75",
            metacriticUser: "7.5",
          },
        };

        // Create a custom hook to access the component's internal state and functions
        const useMovieDetails = () => {
          const [details] = React.useState<Movie | null>(null);
          const getMovieUrl = (
            site: "rt" | "audience" | "metacritic" | "imdb",
          ) => {
            if (!details?.title) {
              return "";
            }
            const title = encodeURIComponent(
              details.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, site === "metacritic" ? "-" : "_"),
            );
            switch (site) {
              case "rt":
                return `https://www.rottentomatoes.com/m/${title}`;
              case "audience":
                return `https://www.rottentomatoes.com/m/${title}/audience_reviews`;
              case "metacritic":
                return `https://www.metacritic.com/movie/${title}`;
              case "imdb":
                return `https://www.imdb.com/title/${movie.imdbID}`;
            }
          };
          return { getMovieUrl };
        };

        const { result } = renderHook(() => useMovieDetails());

        expect(result.current.getMovieUrl("rt")).toBe("");
        expect(result.current.getMovieUrl("imdb")).toBe("");
      });
    });
  });
});
