let urlQueue = [];
let currentTabId = null;
let isProcessing = false;

let engagementConfig = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startScraping') {
    urlQueue = [...message.urls];
    isProcessing = true;
    processNextUrl();
    sendResponse({ success: true });
  } else if (message.action === 'profileScraped') {
    handleScrapedData(message.data, sender.tab.id);
  } else if (message.action === 'startEngagement') {
    engagementConfig = {
      likeCount: message.likeCount,
      commentCount: message.commentCount
    };
    startFeedEngagement();
    sendResponse({ success: true });
  } else if (message.action === 'engagementComplete') {
    handleEngagementComplete(sender.tab.id, message.likedCount, message.commentedCount);
  } else if (message.action === 'engagementProgress') {
    notifyPopup('engagementProgress', message.message);
  } else if (message.action === 'engagementError') {
    notifyPopup('engagementError', message.message);
  }
  return true;
});

async function processNextUrl() {
  if (urlQueue.length === 0) {
    isProcessing = false;
    console.log('All profiles processed!');
    notifyPopup('scrapingComplete', 'All profiles scraped successfully!');
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      title: 'LinkedIn Scraper',
      message: 'All profiles have been scraped successfully!',
      priority: 2
    });
    return;
  }

  const url = urlQueue.shift();
  const username = url.split('/in/')[1]?.split('/')[0]?.split('?')[0] || 'profile';
  notifyPopup('scrapingProgress', `Opening: ${username} (${urlQueue.length + 1} remaining)`);

  try {
    const tab = await chrome.tabs.create({ url: url, active: false });
    currentTabId = tab.id;
    
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['contentScript.js']
      });
      console.log('Content script injected successfully for:', username);
    } catch (error) {
      console.error('Error injecting smart scraper:', error);
      notifyPopup('scrapingError', 'Failed to inject script: ' + error.message);
      chrome.tabs.remove(tab.id);
      processNextUrl();
    }
  } catch (error) {
    console.error('Error creating tab:', error);
    notifyPopup('scrapingError', error.message);
    processNextUrl();
  }
}

async function handleScrapedData(data, tabId) {
  try {
    console.log('Sending data to backend:', data);
    
    if (data.name === 'Scraping Error' || data.bio === 'Scraping failed') {
      console.warn('Skipping error profile:', data);
      notifyPopup('scrapingProgress', `⚠️ Skipped: ${data.url} (failed to scrape)`);
      chrome.tabs.remove(tabId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      processNextUrl();
      return;
    }
    
    const response = await fetch('http://localhost:3000/api/profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Profile saved successfully:', result);
    
    notifyPopup('scrapingProgress', `✓ Saved: ${data.name}`);

    await new Promise(resolve => setTimeout(resolve, 2000));
    
    chrome.tabs.remove(tabId);
    
    const randomDelay = 10000 + Math.random() * 5000;
    console.log(`Waiting ${Math.round(randomDelay/1000)}s before next profile...`);
    await new Promise(resolve => setTimeout(resolve, randomDelay));
    
    processNextUrl();
  } catch (error) {
    console.error('Error sending data to backend:', error);
    notifyPopup('scrapingError', error.message);
    chrome.tabs.remove(tabId);
    processNextUrl();
  }
}

function notifyPopup(action, message) {
  chrome.runtime.sendMessage({
    action: action,
    message: message,
    error: action === 'scrapingError' || action === 'engagementError' ? message : undefined
  }).catch(() => {});
}

async function startFeedEngagement() {
  try {
    console.log('Starting feed engagement with config:', engagementConfig);
    notifyPopup('engagementProgress', 'Opening LinkedIn feed...');

    const tab = await chrome.tabs.create({ 
      url: 'https://www.linkedin.com/feed/', 
      active: true
    });
    
    currentTabId = tab.id;

    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (config) => {
          window.engagementConfig = config;
        },
        args: [engagementConfig]
      });

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['feedEngagement.js']
      });

      console.log('Feed engagement script injected successfully');
      notifyPopup('engagementProgress', 'Automation started...');
    } catch (error) {
      console.error('Error injecting engagement script:', error);
      notifyPopup('engagementError', 'Failed to inject automation script');
      chrome.tabs.remove(tab.id);
    }
  } catch (error) {
    console.error('Error opening LinkedIn feed:', error);
    notifyPopup('engagementError', error.message);
  }
}

async function handleEngagementComplete(tabId, likedCount, commentedCount) {
  console.log(`Engagement completed: ${likedCount} likes, ${commentedCount} comments`);
  notifyPopup('engagementComplete', `✅ Completed: ${likedCount} likes, ${commentedCount} comments`);
  
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    title: 'LinkedIn Engagement',
    message: `Completed: ${likedCount} likes, ${commentedCount} comments`,
    priority: 2
  });
}
