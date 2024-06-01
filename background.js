chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ jobs: [] });
  console.log('Extension installed and storage initialized');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in background script:', request);
  if (request.action === "storeJob") {
    chrome.storage.local.get("jobs", (data) => {
      const jobs = data.jobs || [];
      jobs.push(request.jobData);
      chrome.storage.local.set({ jobs: jobs }, () => {
        sendResponse({ status: "success" });
        console.log('Job stored successfully:', request.jobData);
      });
    });
    return true; // Will respond asynchronously.
  }
});
