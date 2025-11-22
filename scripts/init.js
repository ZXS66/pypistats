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


/** 
 * get the html container, which to be appended download data 
 * @returns {HTMLElement} the ul element under Meta section
 */
function getMetaContainer() {
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
  return ul;
}


/** render loading state */
function renderLoading() {
  const container = getMetaContainer();
  if (!container) {
    return;
  }
  const li = document.createElement("li");
  li.id = "pypistats-loading";
  li.innerHTML = `<span><strong>[${_EXTENSION_NAME}]</strong> loading...</span>`;
  container.appendChild(li);
  return li;
}

/**
 * render the StatsMeta into page
 * @param {DownloadStatsMeta} data
 */
function renderMetadata(data) {
  if (!data) {
    console.error(`[${_EXTENSION_NAME}] invalid data received`);
    return;
  }
  // append downloads info
  const appendItem = (key, value) => {
    const li = document.createElement("li");
    li.innerHTML = `<span><strong>${key}:</strong> ${value}</span>`;
    container.appendChild(li);
  };
  const formatNumber = (num) => {
    num = +num;
    return num.toLocaleString("en-US");
  }
  // sample data: {"data":{"last_day":10720429,"last_month":259462935,"last_week":62910252},"package":"python-dotenv","type":"recent_downloads"}
  const container = getMetaContainer();
  if (!container) {
    return;
  }
  const downloads = data.data;
  appendItem("Downloads last day", formatNumber(downloads?.last_day));
  appendItem("Downloads last week", formatNumber(downloads?.last_week));
  appendItem("Downloads last month", formatNumber(downloads?.last_month));
}

/**
 * get package meta data by package id
 * @param {string} packageId
 * @returns {Promise<DownloadStatsMeta>}
 */
const queryDownloadStatsMeta = async (packageId) => {
  const url = `https://corsproxy.io/https://pypistats.org/api/packages/${packageId}/recent`;
  const resp = await fetch(url);
  const data = await resp.json();
  return data;
};

// initialization: check if the current page is the package detail page
if (
  window.location.hostname === "pypi.org" &&
  window.location.pathname.startsWith("/project/")
) {
  document.addEventListener("DOMContentLoaded", async () => {
    const loadingElement = renderLoading();
    const packageId = window.location.pathname.split("/")[2];
    const data = await queryDownloadStatsMeta(packageId);
    loadingElement?.remove();
    renderMetadata(data);
  });
}
