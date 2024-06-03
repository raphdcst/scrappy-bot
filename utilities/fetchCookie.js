const UserAgent = require("user-agents");

//Fetch the cookies from the vinted website to authenticate the requests
async function fetchCookie(domain = "fr") {
  const fetchP = import("node-fetch").then((mod) => mod.default);
  const fetch = (...args) => fetchP.then((fn) => fn(...args));
  const response = await fetch(`https://vinted.${domain}/catalog`, {
    headers: { "user-agent": new UserAgent().toString() },
  });

  if (!response.ok)
    throw new Error(`Failed to fetch cookies. Status: ${response.status}`);

  const sessionCookies = response.headers.raw()["set-cookie"];
  if (!sessionCookies)
    throw new Error("set-cookie headers not found in the response");

  const parsedCookies = Object.fromEntries(
    sessionCookies.flatMap((cookieHeader) =>
      cookieHeader.split(";").map((cookie) =>
        cookie
          .trim()
          .split("=")
          .map((part) => part.trim())
      )
    )
  );
  const requiredCookies = ["anon_id", "_vinted_fr_session"];

  const cookieHeader = requiredCookies.reduce((acc, cookie) => {
    return parsedCookies[cookie]
      ? `${acc}${cookie}=${parsedCookies[cookie]}; `
      : acc;
  }, "");

  return cookieHeader;
}

module.exports = {
  fetchCookie,
};
