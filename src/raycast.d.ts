import { ComponentType, ReactElement, ReactNode } from "react";

declare module "@raycast/api" {
  interface ListItemProps {
    title: string;
    subtitle?: string;
    accessories?: Array<{ text?: string; icon?: string }>;
    actions?: ReactElement;
  }

  interface ListProps {
    isLoading?: boolean;
    onSearchTextChange?: (text: string) => void;
    searchBarPlaceholder?: string;
    throttle?: boolean;
    children?: ReactElement | ReactElement[];
  }

  interface ActionPanelProps {
    children?: ReactElement | ReactElement[];
  }

  interface ActionProps {
    title: string;
    icon?: string;
    target?: ReactElement;
    url?: string;
    children?: ReactNode;
  }

  interface DetailProps {
    markdown: string;
  }

  const List: ComponentType<ListProps> & {
    Item: ComponentType<ListItemProps>;
  };

  const Action: {
    Push: ComponentType<ActionProps>;
    OpenInBrowser: ComponentType<ActionProps>;
  };

  const ActionPanel: ComponentType<ActionPanelProps>;
  const Detail: ComponentType<DetailProps>;

  const Icon: {
    Eye: string;
    Star: string;
  };

  function showToast(toast: {
    style: "failure" | "success" | "animated";
    title: string;
    message?: string;
  }): void;

  const Toast: {
    Style: {
      Failure: "failure";
    };
  };

  export function getPreferenceValues<T>(): T;

  export {
    List,
    Action,
    ActionPanel,
    Detail,
    Icon,
    showToast,
    Toast,
    ListProps,
    ListItemProps,
    ActionPanelProps,
    ActionProps,
    DetailProps,
  };
}
