const emailRegex =
    // eslint-disable-next-line require-unicode-regexp,unicorn/no-unsafe-regex,no-useless-escape
    /^(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z\-]+\.)+[A-Za-z]{2,}))$/;
export default emailRegex;
