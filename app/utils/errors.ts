export function isNativeError(object: unknown): boolean {
    if (object instanceof Error) {
        return true;
    }
    return false;
}
