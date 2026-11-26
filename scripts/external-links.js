hexo.extend.filter.register('after_post_render', function (data) {
  // 获取你网站的域名，用来区分是内链还是外链
  const siteHost = hexo.config.url.replace(/https?:\/\//, '').replace(/\/$/, '');
  
  // 用正则替换所有的 <a> 标签
  data.content = data.content.replace(/<a\s+([^>]*href="([^"]+)"[^>]*)>/gi, (match, attr, href) => {
    try {
      // 如果是外链（不包含你的域名、不是锚点、不是相对路径）
      if (!href.includes(siteHost) && !href.startsWith('#') && !href.startsWith('/')) {
        // 如果原本没写 rel 属性，就自动加上
        if (!/rel=/.test(attr)) {
          attr += ' rel="noopener noreferrer"';
        }
      }
    } catch (e) {}
    return `<a ${attr}>`;
  });
  
  return data;
});