# 鲸鱼小班回放视频抓取工具

> 一鲸落, 万物生

双减一出, 鲸鱼凉凉了, 预存课时的钱也退不了, 维权无路.

这个脚本是我用来下自己家回放视频的, 如果能帮到其他朋友, 也能稍微开心些.

---
## 准备工作
下面两个方法, 都需要一个`Authorization`值(注意, 这个隐私信息不要给他人).
找到这个值的步骤:


1. 使用 Chrome (或可打开调试窗口的浏览器), 打开页面 https://parent.jingyupeiyou.com/
2. 打开调试窗口: Windows 按 F12 或 Ctrl+Shift+i, Mac 按 Cmd + Opt + i
3. 在页面中登录账号, 然后根据下图操作找到`Authorization`的值

![参考图片](./helper.jpg)

⚠️ 注意: 不要泄露个人信息, 尤其是这个`Authorization`值给他人, 有了这个信息, 可以做很多事. 所以建议自己或家人操作(甚至都不建议使用第一种方法).


## 方法一: 页面手动下载(开发中)
优点: 操作简单
缺点: 需要一个个手动下载整理, 已上课程较多的比较麻烦

## 方法二: 自动批量抓取

优点: 批量, 省事
缺点: 有一定的技术门槛, 需要 Node 环境

2. 下载代码
3. 安装 node 环境(v14+)
4. 执行命令
```
npm install
node main.js
```
5. 根据提示, 在终端填入`Authorization` (上面准备信息里找到的)
6. 开始自动抓取列表下载.

注意: 一定要保持硬盘空间足够, 预估方法 500M * 已上课时数.

PS: 鲸鱼哪天封回放, 别怪我……
不会使用的也不用担心, 理论上它们应该给所有用户提供下载视频的途径的.