const UserAgent = require("user-agents");

//Send the authenticated request
async function vintedSearch(url, cookie) {
  return new Promise(async (resolve) => {
    const controller = new AbortController();
    fetch(url, {
      headers: {
        "user-agent": new UserAgent().toString(),
        Cookie: cookie,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Connection: "keep-alive",
        DNT: "1",
        "Upgrade-Insecure-Requests": "1",
      },
    })
      .then((res) => {
        controller.abort();
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        controller.abort();
        console.error("Error during fetch:", err);
        resolve({ data: [] });
      });
  });
};

module.exports = {
  vintedSearch
}