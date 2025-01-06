import React from "react";

interface ListProps {
  onSearchTextChange?: (text: string) => void;
  children?: React.ReactNode;
}

interface ListItemProps {
  title: string;
}

// Mock List component
export const List = Object.assign(
  ({ onSearchTextChange, children }: ListProps) => {
    // Call onSearchTextChange immediately instead of in useEffect
    if (onSearchTextChange) {
      setTimeout(() => onSearchTextChange("test"), 0);
    }
    return React.createElement("div", { "data-testid": "list" }, children);
  },
  {
    Item: ({ title }: ListItemProps) =>
      React.createElement("div", { "data-testid": "list-item" }, title),
  },
);

interface ActionPanelProps {
  children: React.ReactNode;
}

export const Action = {
  Push: () => React.createElement("div", null),
  OpenInBrowser: () => React.createElement("div", null),
};

export const ActionPanel = ({ children }: ActionPanelProps) =>
  React.createElement("div", null, children);
export const Detail = () => React.createElement("div", null);
export const Icon = { Eye: "eye", Star: "star" };
export const showToast = jest.fn();
export const Toast = { Style: { Failure: "failure" } };

// Mock preferences with test API key
export const getPreferenceValues = jest.fn(() => ({
  apiKey: "test_api_key",
}));
