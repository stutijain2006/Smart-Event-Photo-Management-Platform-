export const withMediaURL = (path : string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${import.meta.env.VITE_APP_MEDIA_URL}${path}`
}