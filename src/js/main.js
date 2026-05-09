import './vendors/jquery-global.js';
import EmblaCarousel from 'embla-carousel';
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
import { CountUp } from 'countup.js';
import './vendors/imagesloaded.pkgd.js';

// import './vendors/overlay.js';
// ========================================================================================================================
// my set Up
//Safari Back Reload
window.onpageshow = function (event) {
  if (event.persisted) {
    // window.location.reload();
    $('body').addClass('ready');

  }
};

function minXS() {
  return window.matchMedia('(min-width: 0px)');
}
function minSM() {
  return window.matchMedia('(min-width: 321px)');
}
function minMD() {
  //  return window.matchMedia('(min-width: 426px)');
  return window.matchMedia('(min-width: 641px)');
}
function minMDLG() {
  return window.matchMedia('(min-width: 835px)');
}
function minLG() {
  return window.matchMedia('(min-width: 1281px)');
}
function minXL() {
  return window.matchMedia('(min-width: 1441px)');
}
function minXXL() {
  return window.matchMedia('(min-width: 1601px)');
}
function maxXS() {
  return window.matchMedia('(max-width: 320px)');
}
function maxSM() {
  //  return window.matchMedia('(max-width: 425px)');
  return window.matchMedia('(max-width: 640px)');
}
function maxMD() {
  return window.matchMedia('(max-width: 834px)');
}
function maxMDLG() {
  return window.matchMedia('(max-width: 1280px)');
}
function maxLG() {
  return window.matchMedia('(max-width: 1440px)');
}

CustomEase.create("cubic_bezier", "0.4, 0, 0.2, 1");


// end my Set Up
// ========================================================================================================================

// LAZY LOADING
function lazyload() {
  var lazyImages = $("img[data-hiResImg]");
  var lazyVideos = $("video[data-lazyVideo]");

  if ("IntersectionObserver" in window) {
    var lazyImageObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var lazyImage = entry.target;
          var hiResImgPath = $(lazyImage).attr("data-hiResImg");
          var dataImgHiRes = $("<img>").attr("src", hiResImgPath);

          // Create an Image object in memory to preload the high-res image natively
          var preloadImg = new Image();

          preloadImg.onload = function () {
            // Once the high-res image is fully downloaded in memory,
            // we stop observing the original lazyImage and swap its source
            lazyImageObserver.unobserve(lazyImage);
            lazyImage.src = hiResImgPath;
            $(lazyImage).addClass("loaded"); // Triggers your CSS opacity fade-in

            setTimeout(function () {
              $(lazyImage).removeAttr("data-hiResImg");
            }, 3000);
          };

          preloadImg.onerror = function () {
            console.error("Failed to load high-res image:", hiResImgPath);
            lazyImageObserver.unobserve(lazyImage);
            $(lazyImage).addClass("imgBroken");
          };

          // Start the download AFTER setting up the listener
          preloadImg.src = hiResImgPath;
        }
      });
    });

    lazyImages.each(function () {
      lazyImageObserver.observe(this);
    });

    var lazyVideoObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.load();
          entry.target.addEventListener("loadeddata", function (event) {
            lazyVideoObserver.unobserve(entry.target);

            var vid = $(entry.target)[0];
            vid.muted = true;
            vid.currentTime = 0;
            vid.pause();

            $(entry.target).addClass("loaded");

            setTimeout(function () {
              $(entry.target).removeAttr("data-lazyVideo");
            }, 3000);

            ScrollTrigger.create({
              trigger: $(entry.target),
              start: "top 100%",
              end: "bottom 0%",
              invalidateOnRefresh: true,
              onEnter: function (self) {
                var vid = $(self.trigger)[0];
                var playPromise = vid.play();
                if (playPromise !== undefined) {
                  playPromise.then(function (_) { }).catch(function (error) { });
                }
              },
              onEnterBack: function (self) {
                var vid = $(self.trigger)[0];
                var playPromise = vid.play();
                if (playPromise !== undefined) {
                  playPromise.then(function (_) { }).catch(function (error) { });
                }
              },
              onLeave: function (self) {
                var vid = $(self.trigger)[0];
                vid.pause();
              },
              onLeaveBack: function (self) {
                var vid = $(self.trigger)[0];
                vid.pause();
              },
            });
          });
        }
      });
    });

    lazyVideos.each(function () {
      lazyVideoObserver.observe(this);
    });
  }
}




// ============================================================
// Astro View Transitions lifecycle hooks
// These run ONCE (on script load) and register persistent listeners.
// ============================================================

// 1. Kill GSAP ScrollTrigger instances BEFORE the page body is swapped.
//    This prevents stale observers from firing against DOM elements that
//    no longer exist on the new page.
document.addEventListener('astro:before-swap', () => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  ScrollTrigger.clearScrollMemory();
});

// 2. Re-apply the saved dark theme immediately AFTER the swap,
//    before the browser paints, to prevent a flash of the wrong theme.
document.addEventListener('astro:after-swap', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'darkTheme') {
    $('body').addClass('darkTheme');
  } else {
    $('body').removeClass('darkTheme');
  }
});

// 3. Run all page initialisation on every page load/navigation.
//    astro:page-load fires after the new page is fully visible and interactive.
document.addEventListener('astro:page-load', function () {

  function checkBH() {
    const browserHeight = $(window).height();
    $('.content').css('height', maxSM() ? 'calc(' + browserHeight + 'px - 80px)' : 'calc(100vh - 100px)');
  }

  checkBH();

  // window resize function — re-attach on every page load
  $(window).off('resize.pageInit').on('resize.pageInit', function () {
    if ($(this).width() !== window._resizeW) {
      window._resizeW = $(this).width();
      clearTimeout(window.resizeTimeout);
      window.resizeTimeout = setTimeout(function () {
        lazyload();
        checkBH();
      }, 200);
    }
  });
  window._resizeW = $(window).width();

  // Dark theme toggle button — re-attach click handlers after each navigation
  function toggleDark() {
    $('.sysItem').off('click.theme mouseenter.theme');
    $('.sysItem').on('click.theme', function (e) {
      $('body').toggleClass('darkTheme');
      localStorage.setItem('theme', $('body').hasClass('darkTheme') ? 'darkTheme' : 'lightTheme');
      e.preventDefault();
    });
    $('.sysItem').on('mouseenter.theme', function () {
      $('#feTurbulenceAnimation').attr('begin', '0s').attr('from', '0').attr('to', '100').get(0).beginElement();
      $('#feDisplacementMapAnimation').attr('begin', '0s').attr('from', '0').attr('to', '40').get(0).beginElement();
    });
  }

  lazyload();
  init();
  $('body').addClass('ready');
  toggleDark();
});

function init() {




  // in view animations
  if ($('[data-inView]').length) {
    var itemQueue = [];
    var delay = 66;
    var queueTimer;
    console.log('check function');
    function processItemQueue() {
      if (queueTimer) return // We're already processing the queue
      queueTimer = window.setInterval(function () {
        if (itemQueue.length) {
          const thisItemQueue = itemQueue.shift();
          $(thisItemQueue).addClass('inView-activated');
          processItemQueue()
        } else {
          window.clearInterval(queueTimer)
          queueTimer = null
        }
      }, delay)
    }

    function inView() {

      var inViewEl = [].slice.call(document.querySelectorAll("[data-inView], [data-CountUpJs]"));
      if ("IntersectionObserver" in window) {
        var fadeInUpObserver = new IntersectionObserver(function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var thisInViewEl = entry.target;
              itemQueue.push(thisInViewEl)
              processItemQueue()
              fadeInUpObserver.unobserve(thisInViewEl);
            }
          });
        });

        inViewEl.forEach(function (inViewEl) {
          fadeInUpObserver.observe(inViewEl);
        });
      } else {
        inViewEl.forEach(function (inViewEl) {
          inViewEl.classList.add("inView-activated");
        });
      }
    }
    inView();
  }

  const elements = document.querySelectorAll("[data-CountUpJs]");

  if (elements.length > 0) {
    ScrollTrigger.batch(elements, {
      onEnter: (batch) => {
        gsap.to(batch, {
          onStart: function () {
            const el = this.targets()[0]; // The element with the data- attribute
            const targetToActivate = el.hasAttribute('data-CountUpJs')
              ? el.closest('.eaItem') || el
              : el;

            targetToActivate.classList.add('inView-activated');

            // 2. TRIGGER THE COUNTUP ON THE SPAN
            const countData = el.getAttribute('data-CountUpJs');
            if (countData) {
              const p = countData.split(',').map(v => parseFloat(v.trim()));

              const factsCount = new CountUp(el, p[1], {
                startVal: p[0],
                duration: 1,
                decimalPlaces: 0,
                useEasing: false,
                useGrouping: true
              });

              if (!factsCount.error) {
                factsCount.start();
              }
            }
          },
          stagger: 0.12,
          overwrite: true
        });
      },
      start: "top bottom",
      once: true
    });
  }


  // parallax 
  if ($('[data-parallax]').length) {
    // apply parallax effect to any element with a data-parallax attribute

    gsap.to("[data-parallax]", {
      y: (i, el) => (1 - parseFloat(el.getAttribute("data-parallax"))) * ScrollTrigger.maxScroll(window),
      ease: "none",
      scrollTrigger: {
        start: 0,
        end: "max",
        invalidateOnRefresh: true,
        scrub: true
      }
    });
  }
  //carousel
  function initEmblaCarousels() {
    // Dots pagination helper for Embla
    const setupDotBtns = (emblaApi, dotsNode) => {
      if (!dotsNode) return () => { };
      let dotNodes = []
      const addDotBtnsWithClickHandlers = () => {
        dotsNode.innerHTML = emblaApi
          .scrollSnapList()
          .map(() => '<button class="embla__dot" type="button"></button>')
          .join('')
        dotNodes = Array.from(dotsNode.querySelectorAll('.embla__dot'))
        dotNodes.forEach((dotNode, index) => {
          dotNode.addEventListener('click', () => emblaApi.scrollTo(index), false)
        })
      }
      const toggleDotBtnsActive = () => {
        const previous = emblaApi.previousScrollSnap()
        const selected = emblaApi.selectedScrollSnap()
        if (dotNodes[previous]) dotNodes[previous].classList.remove('embla__dot--selected')
        if (dotNodes[selected]) dotNodes[selected].classList.add('embla__dot--selected')
      }
      emblaApi
        .on('init', addDotBtnsWithClickHandlers)
        .on('reInit', addDotBtnsWithClickHandlers)
        .on('init', toggleDotBtnsActive)
        .on('reInit', toggleDotBtnsActive)
        .on('select', toggleDotBtnsActive)

      return () => {
        dotsNode.innerHTML = ''
      }
    }

    // 1. owlExpandingCard (Always a carousel)
    const expandingCards = document.querySelectorAll('.owlExpandingCard');
    expandingCards.forEach(node => {
      const viewportNode = node.querySelector('.embla__viewport');
      const dotsNode = node.querySelector('.embla__dots');
      if (viewportNode) {
        const emblaApi = EmblaCarousel(viewportNode, { loop: false, align: 'start' });
        if (dotsNode) setupDotBtns(emblaApi, dotsNode);
      }
    });

    // 2. owl2Col (Desktop-only carousel, Mobile = stack)
    const owl2ColNodes = document.querySelectorAll('.owl2Col');
    owl2ColNodes.forEach(node => {
      const viewportNode = node.querySelector('.embla__viewport');
      const dotsNode = node.querySelector('.embla__dots');
      if (viewportNode) {
        let emblaApi = null;
        let removeDots = null;
        function toggleOwl2Col() {
          if (maxMD().matches) {
            // Mobile: Destroy
            if (emblaApi) {
              if (removeDots) removeDots();
              emblaApi.destroy();
              emblaApi = null;
            }
          } else {
            // Desktop: Init
            if (!emblaApi) {
              emblaApi = EmblaCarousel(viewportNode, { loop: false, align: 'start' });
              if (dotsNode) removeDots = setupDotBtns(emblaApi, dotsNode);
            }
          }
        }
        toggleOwl2Col();
        $(window).on('resize', function () {
          clearTimeout(node.resizeTimeout);
          node.resizeTimeout = setTimeout(toggleOwl2Col, 200);
        });
      }
    });

    // 3. owlTabCaro (Mobile-only carousel, Desktop = grid)
    const tabCaroNodes = document.querySelectorAll('.owlTabCaro');
    tabCaroNodes.forEach(node => {
      const viewportNode = node.querySelector('.embla__viewport');
      const dotsNode = node.querySelector('.embla__dots');
      if (viewportNode) {
        let emblaApi = null;
        let removeDots = null;
        function toggleTabCaro() {
          if (maxMD().matches) {
            // Mobile: Init
            if (!emblaApi) {
              emblaApi = EmblaCarousel(viewportNode, { loop: false, align: 'center' });
              if (dotsNode) removeDots = setupDotBtns(emblaApi, dotsNode);
            }
          } else {
            // Desktop: Destroy
            if (emblaApi) {
              if (removeDots) removeDots();
              emblaApi.destroy();
              emblaApi = null;
            }
          }
        }
        toggleTabCaro();
        $(window).on('resize', function () {
          clearTimeout(node.resizeTimeout);
          node.resizeTimeout = setTimeout(toggleTabCaro, 200);
        });
      }
    });
  }

  initEmblaCarousels();
  // end responsiveOwl    

  if ($('.hoverFilter').length) {
    $('.eaItem').on('mouseenter', function () {
      // Trigger the animation by modifying the begin attribute value
      $('#feTurbulenceAnimation').attr('begin', '0s').attr('from', '0').attr('to', '100').get(0).beginElement();
      $('#feDisplacementMapAnimation').attr('begin', '0s').attr('from', '0').attr('to', '40').get(0).beginElement();
    });
    $('.eaHeaderItem').on('mouseenter', function () {
      // Trigger the animation by modifying the begin attribute value
      $('#feTurbulenceAnimation').attr('begin', '0s').attr('from', '0').attr('to', '100').get(0).beginElement();
      $('#feDisplacementMapAnimation').attr('begin', '0s').attr('from', '0').attr('to', '40').get(0).beginElement();
    });

  }

  // if ($('.tl-effect').length) {
  //   console.log('tl-effect found');
  //   var tl = gsap.timeline({ paused: true });
  //   split = new SplitText(".tl-effect", { type: "words, chars" }),
  //     words = split.words; //an array of all the divs that wrap each character
  //   gsap.set(".tl-effect", { perspective: 400 });

  //   tl.to(words, {
  //     duration: 1.5,
  //     fontWeight: 900, // Update font weight directly
  //     ease: "cubic-bezier(0.4, 0, 0.2, 1)",
  //     stagger: {
  //       each: 0.2,
  //     }

  //   })

  //   $('.replay').on('click', function () {
  //     if (tl.paused()) {
  //       tl.play();
  //       $('#loop').text('replay');
  //     } else {
  //       tl.restart();
  //     }
  //   });

  // }

  if ($('.tl-effect').length) {
    console.log('tl-effect found');
    
    // 2. Correctly initialize SplitText and store result
    var split = new SplitText(".tl-effect", { type: "words, chars" });
    var words = split.words; 
    
    gsap.set(".tl-effect", { perspective: 400 });

    // 3. Setup the timeline
    var tl = gsap.timeline({ paused: true });

    tl.to(words, {
      duration: 1,
      // If using a Variable Font, use 'font-variation-settings' for smoother results
      fontWeight: 900, 
      // 4. Use standard GSAP ease or CustomEase. 
      // "power2.inOut" is a close match to your cubic-bezier
      ease: "power2.inOut", 
      stagger: {
        each: 0.2,
      }
    });

    $('.replay').on('click', function () {
      // 5. Use paused() as a getter to check state
      if (tl.paused()) {
        tl.play();
        $('#loop').text('replay');
      } else {
        tl.restart();
      }
    });
  }


  if ($('.moveContainer').length) {
    const animText = document.querySelector('.mouseMoveEffect');
    const container = document.querySelector('.moveContainer');
  
    // 1. Create a "quickTo" function for the font weight axis
    // This is much faster and handles the interpolation for you
    const weightTo = gsap.quickTo(animText, "font-variation-settings", {
      duration: 0.4, // Small duration creates the smooth 'follow' effect
      ease: "power2.out",
      // Format the value specifically for variable fonts
      onUpdate: function() {
          const val = this.targets()[0].style.fontVariationSettings;
          // ensure formatting remains "'wght' 500"
      }
    });
  
    // Since font-variation-settings is a string, we animate a proxy object instead
    const proxy = { weight: 300 };
    const quickWeight = gsap.quickTo(proxy, "weight", {
      duration: 0.3,
      ease: "power3.out",
      onUpdate: () => {
        gsap.set(animText, { 
          fontVariationSettings: `'wght' ${proxy.weight}`,
          // Keeping fontWeight as a fallback
          fontWeight: proxy.weight 
        });
      }
    });
  
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const normalizedX = (e.clientX - rect.left) / rect.width;
      const targetWeight = 300 + (Math.max(0, Math.min(1, normalizedX)) * 600);
      
      // 2. Simply pipe the new weight into the quickTo function
      quickWeight(targetWeight);
    });
  
    container.addEventListener('mouseleave', () => {
      quickWeight(300);
    });
  }

  // if ($('.moveContainer').length) {
  //   let currentWeight = 300; // Initial font weight
  //   const animText = $('.mouseMoveEffect');
  //   const containerWidth = animText.parent().width();

  //   $('.moveContainer').mousemove(function (e) {
  //     const offsetX = e.clientX - animText.parent().offset().left;
  //     const normalizedOffsetX = offsetX / containerWidth;

  //     const maxWeight = 900;
  //     const minWeight = 300;
  //     const weightRange = maxWeight - minWeight;

  //     const targetWeight = minWeight + normalizedOffsetX * weightRange;

  //     // Apply lerp effect to smoothly transition font weight
  //     currentWeight = lerp(currentWeight, targetWeight, 0.12);
  //     animText.css('font-weight', currentWeight);
  //   });
  // }

  // // Lerp function
  // function lerp(a, b, t) {
  //   return (1 - t) * a + t * b;
  // }




  //=== end of init function ===
}