const formatText = (text: string): string => {
    return text
        .replace("Saigon-Digital/", "")
        .replaceAll("-", " ")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .toUpperCase();
};

export default formatText;