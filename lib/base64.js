export const prepareBase64ForJimp = (base64) => {
    const jpegBase64ExpectedStart = 'data:image/jpeg;base64,';
    const pngBase64ExpectedStart = 'data:image/png;base64,';
    if (base64.startsWith(jpegBase64ExpectedStart)) {
        return base64.slice(jpegBase64ExpectedStart.length)
    }
    if (base64.startsWith(pngBase64ExpectedStart)) {
        return base64.slice(pngBase64ExpectedStart.length)
    }
    return base64;
}