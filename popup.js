document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('getTitle');
  const titleEl = document.getElementById('title');

  btn.addEventListener('click', () => {
    titleEl.textContent = 'Loading...';
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        titleEl.textContent = 'No active tab found.';
        return;
      }
      
      const tabTitle = tabs[0].title || '(no title)';
      titleEl.textContent = tabTitle;
    });
  });
});
