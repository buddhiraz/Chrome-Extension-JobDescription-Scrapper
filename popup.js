document.getElementById("scrape").addEventListener("click", () => {
  const scrapeButton = document.getElementById("scrape");
  console.log('Scrape button clicked');
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    console.log('Active tab:', tabs[0]);
    chrome.tabs.sendMessage(tabs[0].id, { action: "scrape" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error in sending message:', chrome.runtime.lastError.message);
        return;
      }
      console.log('Response from content script:', response);
      if (response && response.jobData) {
        chrome.runtime.sendMessage({ action: "storeJob", jobData: response.jobData }, (response) => {
          console.log('Response from background script:', response);
          if (response.status === "success") {
            loadJobs();
            scrapeButton.classList.add('success');
            setTimeout(() => {
              scrapeButton.classList.remove('success');
            }, 2000); // Remove success class after 2 seconds
          }
        });
      }
    });
  });
});

function cleanHTML(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const unwantedSelectors = [
    '.job-details-how-you-match-card__container',
    'li.job-details-jobs-unified-top-card__job-insight',
    '.mt5 .display-flex',
    '.job-details-jobs-unified-top-card__buttons-container'
  ];
  
  unwantedSelectors.forEach(selector => {
    const elements = tempDiv.querySelectorAll(selector);
    elements.forEach(element => element.remove());
  });

  return tempDiv.innerHTML;
}

function formatJobDetails(details) {
  const container = document.createElement('div');
  const lines = details.split('\n');

  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('<h2>')) {
      const h2 = document.createElement('h2');
      h2.innerHTML = trimmedLine.replace('<h2>', '').replace('</h2>', '');
      container.appendChild(h2);
    } else if (trimmedLine.startsWith('<h3>')) {
      const h3 = document.createElement('h3');
      h3.innerHTML = trimmedLine.replace('<h3>', '').replace('</h3>', '');
      container.appendChild(h3);
    } else if (trimmedLine.startsWith('<h4>')) {
      const h4 = document.createElement('h4');
      h4.innerHTML = trimmedLine.replace('<h4>', '').replace('</h4>', '');
      container.appendChild(h4);
    } else if (trimmedLine.startsWith('<ul>')) {
      const ul = document.createElement('ul');
      ul.innerHTML = trimmedLine.replace('<ul>', '').replace('</ul>', '');
      container.appendChild(ul);
    } else if (trimmedLine.startsWith('<li>')) {
      const li = document.createElement('li');
      li.innerHTML = trimmedLine.replace('<li>', '').replace('</li>', '');
      container.appendChild(li);
    } else {
      const p = document.createElement('p');
      p.innerHTML = trimmedLine;
      container.appendChild(p);
    }
  });

  return container.innerHTML;
}

function loadJobs() {
  chrome.storage.local.get("jobs", (data) => {
    const jobs = data.jobs || [];
    const jobsDiv = document.getElementById("jobs");
    jobsDiv.innerHTML = "";
    jobs.forEach((job, index) => {
      const jobDiv = document.createElement("div");
      jobDiv.className = "job";
      jobDiv.innerHTML = `
        <div class="job-section">
          <h3><a href="${job.jobLink}" target="_blank">${job.jobTitle || 'N/A'}</a></h3>
          <p><strong>Company:</strong> ${job.companyName || 'N/A'}</p>
        </div>
        <div class="job-section">
          ${formatJobDetails(cleanHTML(job.details))}
        </div>
      `;
      jobsDiv.appendChild(jobDiv);
    });
    console.log('Loaded jobs:', jobs);
  });
}

document.addEventListener("DOMContentLoaded", loadJobs);
