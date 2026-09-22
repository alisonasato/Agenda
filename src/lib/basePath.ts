/**
 * The sub-path the app is served under: "/Agenda" on GitHub Pages, empty in dev. next/link applies
 * `basePath` by itself; plain <a>, <img> and fetch() URLs to the app's own files need `withBase`.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const withBase = (path: string) => `${BASE_PATH}${path}`;
