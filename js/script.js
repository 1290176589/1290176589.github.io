window.addEventListener("DOMContentLoaded", function() {
  const html            = document.querySelector("html");
  const navBtn          = document.querySelector(".navbar-btn");
  const navList         = document.querySelector(".navbar-list");
  const backToTopFixed  = document.querySelector(".back-to-top-fixed");
  let lastTop           = 0;
  let lastRefreshTime   = 0;
  let frameCount        = 0;
  let refreshRate       = 0;
  let theme             = window.localStorage.getItem('theme') || '';

  theme && html.classList.add(theme)


  /**
   * 初始化刷新率估计
   */
  const estimateRefreshRate = () => {
      const currentTime = performance.now();
      if (currentTime - lastRefreshTime >= 1000) { // fps
          refreshRate = frameCount;
          frameCount = 0;
          lastRefreshTime = currentTime;
      } else {
          frameCount++;
      }
      requestAnimationFrame(estimateRefreshRate);
  }
  
  estimateRefreshRate();

  const goScrollTop = () => {
    let currentTop = getScrollTop()
    let speed = Math.floor(-currentTop / (refreshRate / 6))
    if (currentTop > lastTop + 0.5 || currentTop < lastTop - 0.5 ) {
      // interrupt the animation
      return lastTop = 0
    }
    let distance = currentTop + speed;
    lastTop = distance;
    document.documentElement.scrollTop = distance;
    distance > 0 && window.requestAnimationFrame(goScrollTop)
  }

  const toggleBackToTopBtn = (top) => {
    top = top || getScrollTop()
    if (top >= 100) {
      backToTopFixed.classList.add("show")
    } else {
      backToTopFixed.classList.remove("show")
    }
  }

  toggleBackToTopBtn()

  // theme light click
  document.querySelector('#theme-light')?.addEventListener('click', function () {
    html.classList.remove('theme-dark')
    html.classList.add('theme-light')
    window.localStorage.setItem('theme', 'theme-light')
  })

  // theme dark click
  document.querySelector('#theme-dark')?.addEventListener('click', function () {
    html.classList.remove('theme-light')
    html.classList.add('theme-dark')
    window.localStorage.setItem('theme', 'theme-dark')
  })

  // theme auto click
  document.querySelector('#theme-auto')?.addEventListener('click', function() {
    html.classList.remove('theme-light')
    html.classList.remove('theme-dark')
    window.localStorage.setItem('theme', '')
  })

  // mobile nav click
  navBtn.addEventListener("click", function () {
    html.classList.toggle("show-mobile-nav");
    this.classList.toggle("active");
  });

  // mobile nav link click
  navList.addEventListener("click", function (e) {
    if (e.target.nodeName == "A" && html.classList.contains("show-mobile-nav")) {
      navBtn.click()
    }
  })

  // click back to top
  backToTopFixed.addEventListener("click", function () {
    lastTop = getScrollTop()
    goScrollTop()
  });

  window.addEventListener("scroll", function () {
    toggleBackToTopBtn()
  }, { passive: true });

  /** handle lazy bg iamge */
  handleLazyBG();
});

/**
 * 获取当前滚动条距离顶部高度
 *
 * @returns 距离高度
 */
function getScrollTop () {
  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
}

function querySelectorArrs (selector) {
  return Array.from(document.querySelectorAll(selector))
}


function handleLazyBG () {
  const lazyBackgrounds = querySelectorArrs('[background-image-lazy]')
  let lazyBackgroundsCount = lazyBackgrounds.length
  if (lazyBackgroundsCount > 0) {
    let lazyBackgroundObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function({ isIntersecting, target }) {
        if (isIntersecting) {
          let img = target.dataset.img
          if (img) {
            target.style.backgroundImage = `url(${img})`
          }
          lazyBackgroundObserver.unobserve(target)
          lazyBackgroundsCount --
        }
        if (lazyBackgroundsCount <= 0) {
          lazyBackgroundObserver.disconnect()
        }
      })
    })

    lazyBackgrounds.forEach(function(lazyBackground) {
      lazyBackgroundObserver.observe(lazyBackground)
    })
  }
}

/* 自动 + 手动滑动轮播图逻辑 */
document.addEventListener('DOMContentLoaded', function() {
  const slider = document.getElementById('header-slider');
  if (!slider) return;

  const track = slider.querySelector('.slider-track');
  const slides = slider.querySelectorAll('.slide-item');
  const dots = slider.querySelectorAll('.dot');
  
  if (slides.length <= 1) return;

  let currentIndex = 0;
  const totalSlides = slides.length;
  let autoPlayTimer;

  // === 核心变量：用于判断拖动 ===
  let startX = 0; // 记录手指/鼠标按下的初始位置
  let currentTranslate = 0; // 当前滑动的距离
  let isDragging = false; // 是否正在拖动

  // 切换图片
  function goToSlide(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;

    currentIndex = index;
    track.style.transition = 'transform 0.4s ease-out'; // 恢复平滑动画
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[currentIndex]) dots[currentIndex].classList.add('active');
  }

  // 自动播放
  function startAutoPlay() {
    autoPlayTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 4000); // 4秒切一次
  }

  // 停止自动播放
  function stopAutoPlay() {
    clearInterval(autoPlayTimer);
  }

  // === 拖拽逻辑 ===
  function dragStart(event) {
    stopAutoPlay(); // 拖动时暂停自动播放
    isDragging = true;
    
    // 兼容鼠标和触摸屏
    startX = event.type.includes('mouse') ? event.pageX : event.touches[0].pageX;
    
    // 获取当前轨道的位移
    const transformMatrix = window.getComputedStyle(track).transform;
    if (transformMatrix !== 'none') {
      currentTranslate = new DOMMatrix(transformMatrix).m41;
    }
    
    // 拖动时去掉过渡动画，让拖动跟手
    track.style.transition = 'none';
  }

  function dragMove(event) {
    if (!isDragging) return;
    
    // 阻止默认的页面滚动（在手机端防误触）
    if (event.cancelable) event.preventDefault();

    const currentX = event.type.includes('mouse') ? event.pageX : event.touches[0].pageX;
    const diffX = currentX - startX; // 计算移动距离
    
    // 计算新的位移，防止拖动超出边界太多（加一点点阻力效果）
    let newTranslate = currentTranslate + diffX;
    track.style.transform = `translateX(${newTranslate}px)`;
  }

  function dragEnd(event) {
    if (!isDragging) return;
    isDragging = false;
    
    track.style.transition = 'transform 0.4s ease-out'; // 恢复动画

    // 获取松手时的最终位移
    const transformMatrix = window.getComputedStyle(track).transform;
    const endTranslate = new DOMMatrix(transformMatrix).m41;
    const diffX = endTranslate - currentTranslate;

    // 如果滑动距离超过 50px，就判定为切换
    if (diffX < -50) {
      goToSlide(currentIndex + 1); // 向左滑，下一张
    } else if (diffX > 50) {
      goToSlide(currentIndex - 1); // 向右滑，上一张
    } else {
      goToSlide(currentIndex); // 没滑动多少，弹回原位
    }
    
    startAutoPlay(); // 松手后重新开始自动播放
  }

  // === 绑定事件监听 ===
  // 鼠标事件 (电脑端)
  slider.addEventListener('mousedown', dragStart);
  window.addEventListener('mousemove', dragMove);
  window.addEventListener('mouseup', dragEnd);

  // 触摸事件 (手机端)
  slider.addEventListener('touchstart', dragStart, { passive: true });
  slider.addEventListener('touchmove', dragMove, { passive: false }); // passive: false 允许 preventDefault
  slider.addEventListener('touchend', dragEnd);

  // 小圆点点击事件
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      stopAutoPlay();
      goToSlide(index);
      startAutoPlay();
    });
  });

  // 启动自动播放
  startAutoPlay();
});