import { ComponentType, ReactElement, ReactNode } from "react";

declare module "@raycast/api" {
  interface IconType {
    source: string;
    tintColor?: string;
  }

  interface ListItemProps {
    title: string;
    subtitle?: string;
    accessories?: Array<{ text?: string; icon?: IconType }>;
    actions?: ReactElement;
  }

  interface ListProps {
    isLoading?: boolean;
    searchText?: string;
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
    icon?: IconType;
    target?: ReactElement;
    url?: string;
    children?: ReactNode;
  }

  interface DetailProps {
    markdown: string;
    isLoading?: boolean;
    metadata?: ReactElement | null;
  }

  interface DetailMetadataTagListItemProps {
    text: string;
    icon?: IconType;
  }

  interface DetailMetadataTagListProps {
    title: string;
    key?: string;
  }

  interface DetailMetadataProps {
    children: ReactElement | ReactElement[];
  }

  const List: ComponentType<ListProps> & {
    Item: ComponentType<ListItemProps>;
    EmptyView: ComponentType<{
      title: string;
      description?: string;
      icon?: string;
    }>;
  };

  const Action: {
    Push: ComponentType<ActionProps>;
    OpenInBrowser: ComponentType<ActionProps>;
    CopyToClipboard: ComponentType<{ title: string; content: string }>;
  };

  const ActionPanel: ComponentType<ActionPanelProps> & {
    Section: ComponentType<{ children?: ReactElement | ReactElement[] }>;
  };

  const Detail: ComponentType<DetailProps> & {
    Metadata: ComponentType<DetailMetadataProps> & {
      TagList: ComponentType<DetailMetadataTagListProps> & {
        Item: ComponentType<DetailMetadataTagListItemProps>;
      };
      Separator: ComponentType<{ key?: string }>;
    };
  };

  const Icon: {
    Eye: string;
    Star: string;
    Circle: string;
    Person: string;
    Target: string;
    Calendar: string;
    ExclamationMark: string;
    MagnifyingGlass: string;
    QuestionMark: string;
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

  function getPreferenceValues<T>(): T;

  export {
    List,
    Action,
    ActionPanel,
    Detail,
    Icon,
    showToast,
    Toast,
    getPreferenceValues,
  };
}
