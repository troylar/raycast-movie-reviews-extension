import React from "react";

// Mock List component
export const List = Object.assign(
  ({ onSearchTextChange, children }: any) => {
    // Call onSearchTextChange immediately instead of in useEffect
    if (onSearchTextChange) {
      setTimeout(() => onSearchTextChange("test"), 0);
    }
    return React.createElement("div", { "data-testid": "list" }, children);
  },
  { Item: (props: any) => React.createElement("div", { "data-testid": "list-item" }, props.title) }
);

export const Action = {
  Push: (props: any) => React.createElement("div", null),
  OpenInBrowser: (props: any) => React.createElement("div", null),
};

export const ActionPanel = (props: any) => React.createElement("div", null, props.children);
export const Detail = (props: any) => React.createElement("div", null);
export const Icon = { Eye: "eye", Star: "star" };
export const showToast = jest.fn();
export const Toast = { Style: { Failure: "failure" } };

// Mock preferences with test API key
export const getPreferenceValues = jest.fn(() => ({
  apiKey: "test_api_key",
}));
