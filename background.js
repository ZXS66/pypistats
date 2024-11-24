/** the name of this extension */
const _EXTENSION_NAME = "pypistats";
/** the host of backend API */
const API_HOST = "https://pypistats.org";

/**
 * get package meta data by package id
 * @param {string} packageId
 * @returns {Promise<string>}
 */
const queryPackageMeta = async (packageId) => {
    const url = `${API_HOST}/packages/${packageId}`;
    const resp = await fetch(url, { mode: 'no-cors' });
    return await resp.text();
}

/**
 * event handler to save the meta data
 * @param {DownloadStatsMeta} data meta data
*/
const saveMeta = async (data) => {
    if (data && data.id) {
        await chrome.storage.local.set({
            [data.id]: data
        });
    }
};

/** try to load meta data from storage
 * @param {string} packageId
 * @returns {Promise<DownloadStatsMeta>}
 */
const tryLoadMetaFromStorage = async (packageId) => {
    const meta = await chrome.storage.local.get(packageId);
    return (meta && meta.id) ? meta : null;
};

const processMessage = async (message, sendor, sendResponse) => {
    const { action, data } = message;
    if (!(action && action.startsWith(_EXTENSION_NAME))) {
        // not for this extension
        return true;
    }
    console.info(`[${_EXTENSION_NAME}] background.js received message: ${action}`);
    const actionName = action.replace(_EXTENSION_NAME, '');
    switch (actionName) {
        case ".query-storage":
            let metaStorage = await tryLoadMetaFromStorage(data);
            // chrome.runtime.sendMessage({ action: `${_EXTENSION_NAME}.storage-result`, data: metaStorage });
            sendResponse({ action: `${_EXTENSION_NAME}.storage-result`, data: metaStorage });
            break;
        case ".query-remote":
            let metaRemote = await queryPackageMeta(data);
            // chrome.runtime.sendMessage({ action: `${_EXTENSION_NAME}.remote-result`, data: metaRemote });
            sendResponse({ action: `${_EXTENSION_NAME}.remote-result`, data: metaRemote });
            break;
        case ".save":
            saveMeta(data);
            break;
        default:
            console.error(`[${_EXTENSION_NAME}] unsupported event name`);
            break;
    }
    console.info(`[${_EXTENSION_NAME}] received event: ${action}`);
    return true;
};

chrome.runtime.onMessage.addListener(processMessage);

// chrome.runtime.onConnect.addListener(async port => {
//     if (port.name.startsWith("https://pypi.org/project/")) {
//         // port.onMessage.addListener(processMessage);
//         // port.postMessage({ action: `${_EXTENSION_NAME}.connected` });
//         // const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
//         // await chrome.tabs.sendMessage(tab.id, { action: `${_EXTENSION_NAME}.connected` });
//         // const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
//         const tabs = await chrome.tabs.query({ url: "https://pypi.org/project/*" });
//         if (tabs?.length) {
//             tabs.forEach(tab => {
//                 chrome.tabs.sendMessage(tab.id, { action: `${_EXTENSION_NAME}.connected` });
//             });
//         }
//     }
// });
