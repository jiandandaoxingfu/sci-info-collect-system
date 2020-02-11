[TOC]

## 科研成果统计系统

这是一款运行在使用Chromium内核的浏览器上(如：360极速浏览器，Google Chrome浏览器，Opera浏览器，QQ浏览器。但不支持IE，Firefox等非Chromium内核的浏览器)的插件，主要用于统计科研成果。

### 操作界面

#### 初始状态

![](https://cdn.nlark.com/yuque/0/2020/png/122742/1581425381432-0b4eee7c-a2ae-4ed5-a3e9-cc944e758fbe.png)

#### 工作状态

![](https://cdn.nlark.com/yuque/0/2020/png/122742/1581426417857-3ebda2fe-db50-495d-8d3a-84b61a49b8a3.png)

### 使用教程

#### 安装插件

**360极速浏览器(测试版本：12.0)**：将插件文件拖动到360极速浏览器页面内，然后会弹出选项框，点击确定

![](https://cdn.nlark.com/yuque/0/2020/png/122742/1581433960468-9fa16fdb-cf43-4424-b679-e25a9cbf89cd.png)

然后浏览器右上角会出现如下的图标

![](https://cdn.nlark.com/yuque/0/2020/png/122742/1581434183513-c71e9ff7-45e3-457a-8201-5c90d866d17f.png)

此时插件即安装成功，点击图标即可开始使用。

**Opera浏览器(测试版本：64.0.3417.61)：**同样拖动插件文件到Opera浏览器页面，然后会弹出如下的提示框

![](https://cdn.nlark.com/yuque/0/2020/png/122742/1581434542119-10c1f061-8233-4d26-9fa0-74092433d85e.png)

点击**转到扩展**，出现下面的页面

![](https://cdn.nlark.com/yuque/0/2020/png/122742/1581434609345-81d58be1-f3ce-41ff-a09e-7a77ad0ea052.png)

点击**安装**，即可使用。

**Chrome浏览器(测试版本：74.0.3729.131)：**首先，将插件文件类型由.crx改为zip，然后解压。然后

打开Chrome浏览器，打开网址：<u>chrome://extensions/</u>，页面如下

![](https://cdn.nlark.com/yuque/0/2020/png/122742/1581435094110-a420bb19-39ad-40d4-9c4b-530ea4060d83.png)

打开开发者模式

![](E:\web\chrome-extension\images\1581435157360.png)

点击**加载已解压的扩展程序**，选择第一步解压的文件所在文件夹即可。

#### 开始使用

##### 输入 

1. 文章标题列表：title1 && title2 && title3 && ...

   两个标题间以‘&&’隔开。

2. 年份：2018, 2019，...

   用以筛选特定时间内引用这篇文献的论文，不同年份以逗号隔开。

3. 作者姓名：Chen-Jing-Run

   输入姓名拼音，首字母均大写且以短横杠隔开。
   
4. 最大下载数：1-10之间，默认为3.

    可以同时搜索多个文章。但由于每一次搜索都会打开一个浏览器标签页，因此，最大下载数越大，同时打开的标签页也就越多，所需计算机资源也就越多，因此要视计算机性能而定，并不是越多越好。

##### 输出 

1. 检索页：成功/出错。如果出错，可能情况是检索不到/检索到多个结果。
2. 引用页：成功/出错。指定年份的引用页。
3. 引用量：整数。指定年份的总引用量。
4. 他引量：整数。指定年份的他引量。
5. 自引量：整数。指定年份的自引量。
6. 详情页：成功/出错。
7. 期刊分区页：成功/出错。
8. 作者顺序：整数。指定姓名在检索结果作者列表中的位置。
9. 进度：空/完成。

###　设计流程图 ![](https://cdn.nlark.com/yuque/0/2020/png/122742/1581427018282-ca9278cf-cdc1-44ce-9ce0-78aabfd4a293.png)

### 第三方库

1. React：create-react-app.
3. Antd.
3. Booststrap.
4. Chrome插件运行环境.
5. 上述库的若干依赖.

### Q&A

1. 软件运行较慢？

   由于数据是从[Web of Science](http://apps.webofknowledge.com/)获取，而其服务器在国外，因此访问速度较慢。此外，软件还受网速的影响。

2. 软件是否可以一直使用？

   不可以。由于数据是从[Web of Science](http://apps.webofknowledge.com/)获取，如果该网站更新系统，则软件可能无法正常使用。后续会提供更新。
   
3. bug提交

    ::e-mail:jiaminxin@outlook.com.

###　Todos

1. 登录中科院分区系统，根据杂志名过去分区信息。
