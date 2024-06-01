console.log('Content script loaded');

function scrapeJobDescription() {
  const jobDetailsWrapper = document.querySelector(".jobs-search__job-details--wrapper");
  if (!jobDetailsWrapper) {
    console.log('Job details wrapper not found');
    return null;
  }

  const companyNameElement = jobDetailsWrapper.querySelector(".job-details-jobs-unified-top-card__company-name a");
  const jobTitleElement = jobDetailsWrapper.querySelector(".job-details-jobs-unified-top-card__job-title h1 a");
  const companyName = companyNameElement ? companyNameElement.innerText.trim() : 'N/A';
  const jobTitle = jobTitleElement ? jobTitleElement.innerText.trim() : 'N/A';
  const jobLink = jobTitleElement ? jobTitleElement.href : '#';

  const jobDetailsElement = jobDetailsWrapper.querySelector("#job-details");
  let jobDetails = jobDetailsElement ? jobDetailsElement.innerHTML.trim() : '';

  // Clean up job details to remove unwanted elements
  const unwantedElements = jobDetailsWrapper.querySelectorAll(".job-details-how-you-match-card__container, .mt5 .display-flex, .job-details-jobs-unified-top-card__buttons-container");
  unwantedElements.forEach(element => element.remove());

  const jobData = {
    companyName: companyName,
    jobTitle: jobTitle,
    jobLink: jobLink,
    details: jobDetails
  };

  return jobData;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in content script:', request);
  if (request.action === "scrape") {
    const jobData = scrapeJobDescription();
    sendResponse({ jobData: jobData });
  }
});
