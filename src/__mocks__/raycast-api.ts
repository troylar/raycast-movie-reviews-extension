import React from "react";

// Mock List component that calls onSearchTextChange
export const List = Object.assign(
  ({ onSearchTextChange, children }: any) => {
    React.useEffect(() => {
      // Call onSearchTextChange with initial value in useEffect
      if (onSearchTextChange) {
        onSearchTextChange("test");
      }
    }, []);
    return React.createElement("div", null, children);
  },
  { Item: (props: any) => React.createElement("div", null, props.title) }
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

// Mock preferences
export const getPreferenceValues = jest.fn(() => ({
  apiKey: "test_api_key",
}));
