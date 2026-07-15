(function () {
  "use strict";

  document.documentElement.classList.add("js");

  function initializeSite() {
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var revealItems = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    var parallaxItems = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
    var tiltItems = Array.prototype.slice.call(document.querySelectorAll("[data-tilt]"));
    var progressBar = document.querySelector(".scroll-progress");
    var typingHeading = document.querySelector("[data-typing-heading]");

    function playHeadingTyping() {
      if (!typingHeading || reduceMotion) {
        return;
      }

      var lines = Array.prototype.slice.call(typingHeading.querySelectorAll("[data-typing-text]"));

      if (!lines.length) {
        return;
      }

      var texts = lines.map(function (line) {
        return line.getAttribute("data-typing-text") || line.textContent;
      });
      var lineIndex = 0;
      var characterIndex = 0;

      lines.forEach(function (line) {
        line.textContent = "";
      });

      typingHeading.classList.add("is-typing");

      function typeCurrentLine() {
        var line = lines[lineIndex];
        var text = texts[lineIndex];

        line.classList.add("is-active");

        if (characterIndex < text.length) {
          characterIndex += 1;
          line.textContent = text.slice(0, characterIndex);
          window.setTimeout(typeCurrentLine, 52);
          return;
        }

        line.classList.remove("is-active");
        lineIndex += 1;
        characterIndex = 0;

        if (lineIndex < lines.length) {
          window.setTimeout(typeCurrentLine, 180);
          return;
        }

        lines[lines.length - 1].classList.add("is-active");
        window.setTimeout(function () {
          lines[lines.length - 1].classList.remove("is-active");
          typingHeading.classList.remove("is-typing");
          typingHeading.classList.add("is-typing-complete");
        }, 720);
      }

      window.setTimeout(typeCurrentLine, 420);
    }

    playHeadingTyping();

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealItems.forEach(function (item) {
        item.classList.add("is-visible");
      });
    } else {
      var observer = new IntersectionObserver(
        function (entries, currentObserver) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              currentObserver.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -8% 0px"
        }
      );

      revealItems.forEach(function (item) {
        observer.observe(item);
      });
    }

    if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
      tiltItems.forEach(function (item) {
        item.addEventListener("pointermove", function (event) {
          var rect = item.getBoundingClientRect();
          var x = (event.clientX - rect.left) / rect.width;
          var y = (event.clientY - rect.top) / rect.height;
          var rotateX = (0.5 - y) * 5;
          var rotateY = (x - 0.5) * 6;

          item.style.setProperty("--pointer-x", (x * 100).toFixed(2) + "%");
          item.style.setProperty("--pointer-y", (y * 100).toFixed(2) + "%");
          item.style.setProperty("--tilt-x", rotateX.toFixed(2) + "deg");
          item.style.setProperty("--tilt-y", rotateY.toFixed(2) + "deg");
          item.classList.add("is-tilting");
        });

        item.addEventListener("pointerleave", function () {
          item.style.setProperty("--tilt-x", "0deg");
          item.style.setProperty("--tilt-y", "0deg");
          item.classList.remove("is-tilting");
        });
      });
    }

    var framePending = false;

    function updateScrollEffects() {
      var scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      var progress = Math.min(Math.max(window.scrollY / scrollable, 0), 1);

      if (progressBar) {
        progressBar.style.setProperty("--scroll-progress", progress.toFixed(4));
      }

      if (!reduceMotion) {
        parallaxItems.forEach(function (item) {
          var speed = Number(item.getAttribute("data-parallax")) || 0.5;
          var rect = item.getBoundingClientRect();
          var distanceFromCenter = rect.top + rect.height / 2 - window.innerHeight / 2;
          var offset = Math.max(-34, Math.min(34, distanceFromCenter * speed * -0.045));
          item.style.setProperty("--parallax-y", offset.toFixed(2) + "px");
        });
      }

      framePending = false;
    }

    function requestScrollUpdate() {
      if (!framePending) {
        framePending = true;
        window.requestAnimationFrame(updateScrollEffects);
      }
    }

    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    window.addEventListener("resize", requestScrollUpdate);
    updateScrollEffects();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeSite, { once: true });
  } else {
    initializeSite();
  }
})();
