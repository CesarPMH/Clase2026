const animatedElements = document.querySelectorAll(
  ".hero-content, .hero-art, .category-banner, .section-heading, .product-card"
);

if (animatedElements.length > 0) {
  document.documentElement.classList.add("js-enabled");

  const showAllElements = () => {
    animatedElements.forEach((element) => element.classList.add("is-visible"));
  };

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    showAllElements();
  } else {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    animatedElements.forEach((element) => {
      element.classList.add("reveal");
      observer.observe(element);
    });
  }
}
