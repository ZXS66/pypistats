/** meta data for the PyPi package */
class DownloadStatsMeta {
  /**
   * initialize the meta data
   * @param {string} id python package id
   * @param {number} downloads_lastday
   * @param {number} downloads_lastweek
   * @param {number} downloads_lastmonth
   */
  constructor(id, downloads_lastday, downloads_lastweek, downloads_lastmonth) {
    this.id = id;
    this.downloads_lastday = downloads_lastday;
    this.downloads_lastweek = downloads_lastweek;
    this.downloads_lastmonth = downloads_lastmonth;
  }
}

/** the name of this extension */
const _EXTENSION_NAME = "pypistats";

/** base URL of backend API */
const API_BASE = "https://johnzhu.cn/pypistats";

/**
 * render the StatsMeta into page
 * @param {DownloadStatsMeta} data
 */
function renderMetadata(data) {
  if (!data) {
    console.error(`[${_EXTENSION_NAME}] invalid data received`);
    return;
  }
  const headers = document.querySelectorAll(".sidebar-section h6");
  let metaHeader = null;
  // find the meta header
  for (let i = 0; i < headers.length; i++) {
    if (headers[i].textContent.trim() === "Meta") {
      metaHeader = headers[i];
      break;
    }
  }
  // find the ul element by metaHeader
  const ul = metaHeader?.nextElementSibling;
  if (!ul?.tagName === "UL") {
    console.error(`[${_EXTENSION_NAME}] cannot find ul element`);
    return;
  }
  // append downloads info
  const appendItem = (key, value) => {
    const li = document.createElement("li");
    li.innerHTML = `<span><strong>${key}:</strong> ${value}</span>`;
    ul.appendChild(li);
  };
  appendItem("Downloads last day", formatNumber(data.downloads_lastday));
  appendItem("Downloads last week", formatNumber(data.downloads_lastweek));
  appendItem("Downloads last month", formatNumber(data.downloads_lastmonth));
}

function formatNumber(num) {
  num = +num;
  return num.toLocaleString("en-US");
}

/**
 * get package meta data by package id
 * @param {string} packageId
 * @returns {Promise<DownloadStatsMeta>}
 */
const queryDownloadStatsMeta = async (packageId) => {
  const url = `${API_BASE}/package/${packageId}`;
  const resp = await fetch(url, { method: "POST" });
  return await resp.json();
};

// initialization: check if the current page is the package detail page
if (
  window.location.hostname === "pypi.org" &&
  window.location.pathname.startsWith("/project/")
) {
  document.addEventListener("DOMContentLoaded", async () => {
    const packageId = window.location.pathname.split("/")[2];
    const data = await queryDownloadStatsMeta(packageId);
    renderMetadata(data);
  });
}
