国产好剧 静态电影网站

生成内容：
- 首页 index.html（含 Hero 轮播、精选、推荐、分类、排行榜区块）
- 分类总览 categories.html
- 全部片库 all.html（含 2000 部影片卡片与搜索筛选）
- 热播排行榜 rankings.html
- 分类页 8 个
- 影片详情页 2000 个
- 资源文件 assets/styles.css、assets/app.js、assets/movies.js
- robots.txt、sitemap.xml

封面图片：
页面已按影片序号循环引用顶级目录 1.jpg 到 150.jpg。
部署时请将 1.jpg、2.jpg ... 150.jpg 放在本目录根级，即与 index.html 同级。

播放器：
详情页播放器使用影片绑定的 m3u8 地址，并通过 HLS.js 初始化播放；Safari 等支持原生 HLS 的浏览器会使用原生播放。

部署方式：
将本文件夹整体上传到任意静态空间即可访问。
