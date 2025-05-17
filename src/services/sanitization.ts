import DOMPurify from "dompurify";

export const HTMLsanitization = (htmlContent:string) => {
    const allowedTags = [
        "p", "strong", "em", "ul", "li", "a", "ol", "br",
        "h1", "h2", "h3", "h4", "h5", "h6", "b",
        "blockquote", "code", "hr", "pre", "img", "div"
    ];

    const allowedAttributes = [
        "class", "style", "href", "title", "target", "src", "alt", "className"
    ];

    return DOMPurify.sanitize(htmlContent, {
        ALLOWED_TAGS: allowedTags,
        ALLOWED_ATTR: allowedAttributes,
    });
}