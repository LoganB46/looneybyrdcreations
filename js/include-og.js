async function loadNavbar() {
  const res = await fetch("navbar.html");
  const html = await res.text();
  document.getElementById("navbar").innerHTML = html;

  // Highlight active page
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach(link => {
    const href = link.getAttribute("href");
    if (href === current) {
      link.classList.add("active");
    }
  });
}

loadNavbar();