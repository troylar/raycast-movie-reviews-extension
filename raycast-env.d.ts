/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** OMDB API Key - Your OMDB API key. Get one at http://www.omdbapi.com/apikey.aspx */
  "apiKey": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `movies` command */
  export type Movies = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `movies` command */
  export type Movies = {}
}

