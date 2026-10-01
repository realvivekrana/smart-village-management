/*
| User ke search text ko regex me safe banata hai.
| Bina escape ke "(" ya "[" jaisa input 500 error deta hai (aur ReDoS ka risk hota hai).
*/
const escapeRegex = (value = "") =>
  String(value).trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = escapeRegex;