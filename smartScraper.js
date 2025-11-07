console.log("Smart Scraper loaded on:", window.location.href);

function smartExtractData() {
  const data = {
    name: "",
    url: window.location.href.split("?")[0],
    about: "",
    bio: "",
    location: "",
    follower_count: 0,
    connection_count: 0
  };
  
  const title = document.title;
  if (title && title !== "LinkedIn") {
    const match = title.match(/^(.+?)(?:\s*[\|\-])/);
    if (match) {
      data.name = match[1].trim();
    }
  }
  
  const pageText = document.body.innerText;
  
  const followerMatch = pageText.match(/(\d{1,3}(?:,\d{3})*|\d+)\s+followers?/i);
  if (followerMatch) {
    data.follower_count = parseInt(followerMatch[1].replace(/,/g, ""));
  }
  
  const connectionMatch = pageText.match(/(\d{1,3}(?:,\d{3})*|\d+)\s+connections?/i);
  if (connectionMatch) {
    data.connection_count = parseInt(connectionMatch[1].replace(/,/g, ""));
  }
  
  const profileCard = document.querySelector(".pv-text-details__left-panel, .ph5, main section");
  if (profileCard) {
    const allDivs = profileCard.querySelectorAll("div");
    for (const div of allDivs) {
      const text = div.textContent.trim();
      if (text && text !== data.name && text.length > 15 && text.length < 500 &&
          !text.includes("follower") && !text.includes("connection") &&
          !text.includes("Contact info") && !text.includes("Message") &&
          !div.querySelector("button") && !div.querySelector("a")) {
        const looksLikeBio = text.match(/\b(at|CEO|Founder|Director|Manager|Engineer|Developer)\b/i);
        if (looksLikeBio) {
          data.bio = text;
          break;
        }
      }
    }
  }
  
  if (profileCard) {
    const smallTextElements = document.querySelectorAll("span.text-body-small");
    for (const elem of smallTextElements) {
      const text = elem.textContent.trim();
      if (text.includes(",") && text.length > 5 && text.length < 60 &&
          !text.includes("follower") && !text.includes("connection")) {
        data.location = text;
        break;
      }
    }
  }
  
  const aboutSection = document.querySelector("#about");
  if (aboutSection) {
    const parentSection = aboutSection.closest("section");
    if (parentSection) {
      const spans = parentSection.querySelectorAll("span.visually-hidden");
      for (const span of spans) {
        const text = span.textContent.trim();
        if (text.length > 100 && !text.includes("About")) {
          data.about = text;
          break;
        }
      }
    }
  }
  
  if (!data.name || data.name.length < 2) {
    const h1 = document.querySelector("h1");
    if (h1) data.name = h1.textContent.trim();
  }
  
  if (!data.name || data.name.length < 2) {
    data.name = "Unknown User";
  }
  
  return data;
}

setTimeout(() => {
  try {
    const profileData = smartExtractData();
    chrome.runtime.sendMessage({ action: "profileScraped", data: profileData });
  } catch (error) {
    chrome.runtime.sendMessage({
      action: "profileScraped",
      data: { name: "Error", url: window.location.href.split("?")[0], about: "", bio: error.toString(), location: "", follower_count: 0, connection_count: 0 }
    });
  }
}, 3000);
