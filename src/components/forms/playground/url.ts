export function sanitizeUrl(url: string): string {
    try {
        const parsedUrl = new URL(url);
        // Only allow http and https protocols
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
            return "https://";
        }
        return url;
    } catch {
        // If URL is invalid, return a safe default
        return "https://";
    }
}

export function validateUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

