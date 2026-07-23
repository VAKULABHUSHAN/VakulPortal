document.querySelectorAll(".link-btn").forEach(link => {
  // Add active state scaling
  link.addEventListener("mousedown", () => {
    link.style.transform = "scale(0.97)";
  });

  link.addEventListener("mouseup", () => {
    link.style.transform = "";
  });

  link.addEventListener("mouseleave", () => {
    link.style.transform = "";
  });

  // Track mouse position for the dynamic glow effect
  link.addEventListener("mousemove", event => {
    const rect = link.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Update CSS custom properties
    link.style.setProperty("--x", `${x}px`);
    link.style.setProperty("--y", `${y}px`);
  });
});
