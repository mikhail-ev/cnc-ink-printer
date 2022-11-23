export const prepareBase64ForJimp = (base64) => {
    const base64ExpectedStart = 'data:image/jpeg;base64,';
    if (base64.startsWith(base64ExpectedStart)) {
        return base64.slice(base64ExpectedStart.length)
    }
    return base64;
}