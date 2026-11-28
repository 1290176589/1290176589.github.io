// 1. 处理外链安全（保留你原本的功能）
hexo.extend.filter.register('after_post_render', function (data) {
  const siteHost = hexo.config.url.replace(/https?:\/\//, '').replace(/\/$/, '');
  
  data.content = data.content.replace(/<a\s+([^>]*href="([^"]+)"[^>]*)>/gi, (match, attr, href) => {
    try {
      if (!href.includes(siteHost) && !href.startsWith('#') && !href.startsWith('/')) {
        if (!/rel=/.test(attr)) {
          attr += ' rel="noopener noreferrer"';
        }
      }
    } catch (e) {}
    return `<a ${attr}>`;
  });
  
  return data;
});

// 2. 注入首页滚动动画脚本
hexo.extend.filter.register('after_render:html', function (str, data) {
  // 判断是否是首页（Hexo 中首页的 path 通常是 index.html 或为空）
  if (data.path === 'index.html' || data.path === '') {
    // 将动画脚本插入到网页底部
    const script = `
      <script>
        document.addEventListener("DOMContentLoaded", function() {
          const articleList = document.querySelector('.body-container');
          if (articleList) {
            // 初始状态：往下偏移 60px，隐藏
            articleList.style.opacity = '0';
            articleList.style.transform = 'translateY(60px)';
            articleList.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';

            // 监听元素是否进入屏幕
            const observer = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  // 进入屏幕时，恢复原位并显示
                  articleList.style.opacity = '1';
                  articleList.style.transform = 'translateY(0)';
                  observer.unobserve(articleList); // 触发一次后停止监听
                }
              });
            }, { threshold: 0.1 }); // 当文章列表露出 10% 时触发

            observer.observe(articleList);
          }
        });
      </script>
    `;
    return str.replace('</body>', script + '</body>');
  }
  return str;
});

// 3. 注入导航栏滚动特效
hexo.extend.filter.register('after_render:html', function (str) {
  const script = `
    <script>
      document.addEventListener("DOMContentLoaded", function() {
        const navbar = document.getElementById("navbar");
        window.addEventListener("scroll", function() {
          // 当向下滚动超过 50px 时
          if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
          } else {
            // 回到顶部时移除特效
            navbar.classList.remove("scrolled");
          }
        });
      });
    </script>
  `;
  return str.replace('</body>', script + '</body>');
});

// 4. 注入文章页模块滚动视差显现动画
hexo.extend.filter.register('after_render:html', function (str, data) {
  const script = `
    <script>
      document.addEventListener("DOMContentLoaded", function() {
        const postContent = document.getElementById("post-content");
        
        if (postContent) {
          // 获取文章里除了第一行之外的所有子元素（包括 h2, h3, p, div, img 等）
          const elements = postContent.children;
          
          // 先给这些元素加上初始状态（往下偏移、透明）
          for (let i = 0; i < elements.length; i++) {
            elements[i].style.opacity = '0';
            elements[i].style.transform = 'translateY(40px)';
            elements[i].style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
          }

          // 使用 IntersectionObserver 监听它们是否进入屏幕
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                // 进入屏幕时，恢复原位并显示
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                // 触发后取消监听，避免滑回去又消失
                observer.unobserve(entry.target);
              }
            });
          }, { 
            threshold: 0.05, // 元素露出 5% 就开始触发
            rootMargin: "0px 0px -50px 0px" // 稍微提前一点触发，体验更好
          });

          // 让所有子元素都进入监听
          for (let i = 0; i < elements.length; i++) {
            observer.observe(elements[i]);
          }
        }
      });
    </script>
  `;
  return str.replace('</body>', script + '</body>');
});