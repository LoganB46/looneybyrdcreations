async function loadNavbar() {
  const url = "/navbar.html?v=" + Date.now(); // cache buster
  const res = await fetch(url, { cache: "no-store" });
  const html = await res.text();

  window.__NAVBAR_HTML__ = html;

  console.log("FETCHED FROM:", res.url);
console.log("Has twitter.com:", html.includes("twitter.com"));
console.log("Has tiktok.com:", html.includes("tiktok.com"));
console.log("Has <svg:", html.includes("<svg"));
console.log("First twitter index:", html.indexOf("twitter"));
console.log("First tiktok index:", html.indexOf("tiktok"));

  console.log("Loaded navbar length:", html.length);
  console.log("Has Instagram:", html.includes("bi-instagram"));
  console.log("Has Twitter:", html.includes("bi-twitter-x"));
  console.log("Has TikTok:", html.includes("bi-tiktok"));

  document.getElementById("navbar").innerHTML = html;

  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("#navbar .nav-link").forEach(link => {
    const href = (link.getAttribute("href") || "").replace(/^\//, "");
    if (href === current) link.classList.add("active");
  });
}

loadNavbar();