// Initialize medium zoom.
$(document).ready(function () {
  medium_zoom = mediumZoom("[data-zoomable]", {
    background: getComputedStyle(document.documentElement).getPropertyValue("--global-bg-color") + "ee", // + 'ee' for trasparency.
  });

  let zoomedImages = [];
  medium_zoom.on("opened", () => {
    // Render at the final size so Safari does not magnify a thumbnail-sized layer.
    zoomedImages = Array.from(document.querySelectorAll(".medium-zoom-image--opened"), (image) => {
      const style = image.style.cssText;
      const rect = image.getBoundingClientRect();
      image.style.setProperty("transition", "none", "important");
      Object.assign(image.style, {
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        left: `${rect.left + window.scrollX}px`,
        top: `${rect.top + window.scrollY}px`,
        transform: "none",
        willChange: "auto",
      });
      return { image, style };
    });
  });

  medium_zoom.on("close", () => {
    // Restore the transformed geometry before letting medium-zoom animate back.
    zoomedImages.forEach(({ image, style }) => {
      image.style.cssText = style;
      image.style.setProperty("transition", "none", "important");
      void image.offsetWidth;
      image.style.removeProperty("transition");
      image.style.transform = "";
    });
    zoomedImages = [];
  });
});
