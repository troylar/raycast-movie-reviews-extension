/** @jest-environment jsdom */
/** @jsx React.createElement */
import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, act } from "@testing-library/react";
import fetch from "node-fetch";
import Command, { MovieActions } from "./movies";
import { showToast } from "@raycast/api";

// Mock node-fetch
jest.mock("node-fetch");
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock Raycast API
jest.mock("@raycast/api");

describe("Movies Extension", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Command component", () => {
    it("should fetch movies when search text changes", async () => {
      const mockMovieData = {
        Response: "True",
        Search: [
          {
            Title: "Test Movie",
            Year: "2023",
            imdbID: "tt1234567",
            Poster: "https://example.com/poster.jpg",
          },
        ],
      };

      mockedFetch.mockResolvedValueOnce({
        json: async () => mockMovieData,
      } as any);

      await act(async () => {
        render(React.createElement(Command));
        // Wait for debounce
        await new Promise(resolve => setTimeout(resolve, 400));
      });

      expect(mockedFetch).toHaveBeenCalledWith(
        expect.stringContaining("test")
      );
    });

    it("should handle API errors gracefully", async () => {
      mockedFetch.mockRejectedValueOnce(new Error("API Error"));

      await act(async () => {
        render(React.createElement(Command));
        // Wait for debounce
        await new Promise(resolve => setTimeout(resolve, 400));
      });

      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Failed to fetch movies",
        })
      );
    });
  });

  describe("MovieActions component", () => {
    it("should fetch movie details", async () => {
      const mockMovie = {
        title: "Test Movie",
        year: "2023",
        imdbID: "tt1234567",
        poster: "https://example.com/poster.jpg",
      };

      const mockDetails = {
        Response: "True",
        Plot: "Test plot",
        Actors: "Actor 1, Actor 2",
        imdbRating: "8.5",
        Ratings: [
          {
            Source: "Rotten Tomatoes",
            Value: "90%",
          },
        ],
      };

      mockedFetch.mockResolvedValueOnce({
        json: async () => mockDetails,
      } as any);

      await act(async () => {
        render(React.createElement(MovieActions, { movie: mockMovie }));
      });

      expect(mockedFetch).toHaveBeenCalledWith(
        expect.stringContaining(mockMovie.imdbID)
      );
    });

    it("should handle API errors gracefully", async () => {
      const mockMovie = {
        title: "Test Movie",
        year: "2023",
        imdbID: "tt1234567",
        poster: "https://example.com/poster.jpg",
      };

      mockedFetch.mockRejectedValueOnce(new Error("API Error"));

      await act(async () => {
        render(React.createElement(MovieActions, { movie: mockMovie }));
      });

      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Failed to fetch movie details",
        })
      );
    });
  });
});
