document.querySelectorAll(".link-btn").forEach(link => {

  link.addEventListener("mousedown", () => {
    link.style.transform = "scale(0.97)";
  });

  link.addEventListener("mouseup", () => {
    link.style.transform = "";
  });

  link.addEventListener("mouseleave", () => {
    link.style.transform = "";
  });

  link.addEventListener("mousemove", event => {
    const rect = link.getBoundingClientRect();
    link.style.setProperty("x", `${event.clientX - rect.left}px`);
    link.style.setProperty("y", `${event.clientY - rect.top}px`);
  });

});
