---
theme: juejin
highlight: a11y-dark
---

# axios-ajax

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/602a1c2d4dd441979f6614f259038868~tplv-k3u1fbpfcp-watermark.image?)
## 一、什么是axios，有什么特性

#### 描述
axios是一个基于`promise`的`HTTP`库，可以用在`浏览器`或者`node.js`中。本文围绕XHR。
> axios提供两个http请求适配器，XHR和HTTP。XHR的核心是浏览器端的XMLHttpRequest对象；HTTP的核心是node的http.request方法。

**特性**：
-   从浏览器中创建XMLHttpRequests
-   从node.js创建http请求
-   支持promise API
-   拦截请求与响应
-   转换请求数据与响应数据
-   取消请求
-   自动转换JSON数据
-   客户端支持防御XSRF
#### 背景
自`Vue`2.0起，尤大宣布取消对 `vue-resource` 的官方推荐，转而推荐 `axios`。现在 `axios` 已经成为大部分 `Vue` 开发者的首选，目前在github上有87.3k star。`axios`的熟练使用和基本封装也成为了vue技术栈系列必不可少的一部分。如果你还不了解axios，建议先熟悉
[axios官网文档](https://axios-http.com/docs/intro)。

#### 基本使用

安装
```shell
npm install axios -S
```
使用
```javascript
import axios from 'axios'
// 为给定ID的user创建请求 
axios.get('/user?ID=12345')   
    .then(function (response) {     
        console.log(response);   
    })   
    .catch(function (error) {    
        console.log(error);   
    });  
// 上面的请求也可以这样做 
axios.get('/user', {     
    params: {ID: 12345}})   
    .then(function (response) {     
        console.log(response);   
    })   
    .catch(function (error) {     
        console.log(error);   
    });
```
## 二、Vue项目中为什么要封装axios
`axios`的API很友好，可以在项目中直接使用。但是在大型项目中，http请求很多，且需要区分环境，
每个网络请求有相似需要处理的部分，如下，会导致代码冗余，破坏工程的`可维护性`，`扩展性`
```js
axios('http://www.kaifa.com/data', {
  // 配置代码
  method: 'GET',
  timeout: 3000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  // 其他请求配置...
})
.then((data) => {
  // todo: 真正业务逻辑代码
  console.log(data);
}, (err) => {
  // 错误处理代码  
  if (err.response.status === 401) {
  // handle authorization error
  }
  if (err.response.status === 403) {
  // handle server forbidden error
  }
  // 其他错误处理.....
  console.log(err);
});
```

- 环境区分
- 请求头信息
- 请求类型
- 请求超时时间
    - timeout: 3000
- 允许携带cookie
    - withCredentials: true
- 响应结果处理
    - 登录校验失败
    - 无权限
    - 成功
- ...

## 三、Vue项目中如何封装axios
axios文件封装在目录`src/utils/https.js`，对外暴露`callApi`函数
####  1、环境区分
`callApi`函数暴露`prefixUrl`参数，用来配置api url`前缀`，默认值为`api`
```js
// src/utils/https.js
import axios from 'axios'

export const callApi = ({
  url,
  ...
  prefixUrl = 'api'
}) => {
  if (!url) {
    const error = new Error('请传入url')
    return Promise.reject(error)
  }
  const fullUrl = `/${prefixUrl}/${url}`
  
  ...
  
  return axios({
    url: fullUrl,
    ...
  })
}
```

看到这里大家可能会问，为什么不用axios提供的配置参数`baseURL`，原因是`baseURL`会给每个接口都加上对应前缀，而项目实际场景中，存在一个前端工程，对应多个`服务`的场景。需要通过不用的前缀代理到不同的服务，`baseURL`虽然能实现，但是需要二级前缀，不优雅，且在使用的时候看不到真实的api地址是啥，因为代理前缀跟真实地址混合在一起了

使用`baseURL`，效果如下

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d55ea16e20694bb4ad68ee506c830007~tplv-k3u1fbpfcp-watermark.image)

函数设置prefixUrl参数，效果如下
![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/613abcca4b2b4a7095974f6748072671~tplv-k3u1fbpfcp-watermark.image)

利用`环境变量`及`webpack代理`(这里用vuecli3配置)来作判断，用来区分开发、测试环境。生产环境同理配置`nginx`代理
```js
// vue.config.js
const targetApi1 = process.env.NODE_ENV === 'development' ? "http://www.kaifa1.com" : "http://www.ceshi1.com"

const targetApi2 = process.env.NODE_ENV === 'development' ? "http://www.kaifa2.com" : "http://www.ceshi2.com"
module.exports = {
    devServer: {
        proxy: {
            '/api1': {
                target: targetApi1,
                changeOrigin: true,
                pathRewrite: {
                    '/api1': ""
                }
            },
            '/api2': {
                target: targetApi2,
                changeOrigin: true,
                pathRewrite: {
                    '/api2': ""
                }
            },
        }
    }
}
```
####  2、请求头
常见以下三种

**(1)application/json**

参数会直接放在请求体中，以JSON格式的发送到后端。这也是axios请求的默认方式。这种类型使用最为广泛。

![image](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/10a319a7114d4f8b96c7cd6ee6f480d6~tplv-k3u1fbpfcp-zoom-1.image "image")

**(2)application/x-www-form-urlencoded**

请求体中的数据会以普通表单形式（键值对）发送到后端。

![image](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/59702b0ce1744f8e8eaca3482aebbd94~tplv-k3u1fbpfcp-zoom-1.image "image")

**(3)multipart/form-data**

参数会在请求体中，以标签为单元，用分隔符(可以自定义的boundary)分开。既可以上传键值对，也可以上传文件。通常被用来上传文件的格式。

![image](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/704ca7c37dca4a9083ed5680e2b13b3c~tplv-k3u1fbpfcp-zoom-1.image "image")
`callApi`函数暴露`contentType`参数，用来配置`请求头`，默认值为`application/json; charset=utf-8`

看到这里大家可以会疑惑，直接通过`options`配置`headers`不可以嘛，答案是可以的，可以看到`newOptions`的取值顺序，先取默认值，再取配置的`options`，最后取`contentType`，`contentType`能满足绝大部分场景，满足不了的场景下可用`options`配置

通过`options`配置`headers`，写n遍`headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'}`；而通过`contentType`配置，传参`json || urlencoded || multipart`即可

当`contentType` === `urlencoded`时，`qs.stringify(data)`

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/109cab9228dd4aa39d7c521e14ae817d~tplv-k3u1fbpfcp-watermark.image)
```js
// src/utils/https.js
import axios from 'axios'
import qs from 'qs'

const contentTypes = {
  json: 'application/json; charset=utf-8',
  urlencoded: 'application/x-www-form-urlencoded; charset=utf-8',
  multipart: 'multipart/form-data',
}

const defaultOptions = {
  headers: {
    Accept: 'application/json',
    'Content-Type': contentTypes.json,
  }
}

export const callApi = ({
  url,
  data = {},
  options = {},
  contentType = 'json', // json || urlencoded || multipart
  prefixUrl = 'api'
}) => {

  ...
  
  const newOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      'Content-Type': options.headers && options.headers['Content-Type'] || contentTypes[contentType],
    },
  }
  
  const { method } = newOptions

  if (method !== 'get' && method !== 'head') {
    if (data instanceof FormData) {
      newOptions.data = data
      newOptions.headers = {
        'x-requested-with': 'XMLHttpRequest',
        'cache-control': 'no-cache',
      }
    } else if (options.headers['Content-Type'] === contentTypes.urlencoded) {
      newOptions.data = qs.stringify(data)
    } else {
      Object.keys(data).forEach((item) => {
        if (
          data[item] === null ||
          data[item] === undefined ||
          data[item] === ''
        ) {
          delete data[item]
        }
      })
      // 没有必要，因为axios会将JavaScript对象序列化为JSON
      // newOptions.data = JSON.stringify(data);
    }
  }
  
  return axios({
    url: fullUrl,
    ...newOptions,
  })
}
```
注意，在`application/json`格式下，JSON.stringify处理传参没有意义，因为axios会将JavaScript对象序列化为JSON，也就说无论你转不转化都是JSON
####  3、请求类型
请求类型参数为`axios`的`options`的`method`字段，传入对应的请求类型如`post`、`get`等即可

不封装，使用原生`axios`时，`发送带参数的get请求`如下：
```js
// src/service/index.js
import { callApi } from '@/utils/https';

export const delFile = (params) => callApi({
  url: `file/delete?systemName=${params.systemName}&menuId=${params.menuId}&appSign=${params.appSign}`,
  option: {
    method: 'get',
  },
});

// 或者
export const delFile = (params) => callApi({
  url: 'file/delete',
  option: {
    method: 'get',
    params
  },
});
```
官方文档如下

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b45043c4691a40e6b00764d2534430e8~tplv-k3u1fbpfcp-watermark.image)

`callApi`函数暴露`method`参数，用来配置`请求类型`，默认值为`get`

当请求类型为`get`时，将`callApi`函数暴露的`data`参数，设置为`options.params`，从而参数自动拼接到url地址之后

```js
// src/utils/https.js 
import axios from 'axios' 

export const callApi = ({
  url,
  data = {},
  method = 'get',
  options = {},
  ...
  prefixUrl = 'api'
}) => {
    ...
    const newOptions = {
        ...,
        ...options,
        method
    }
    ...
    if(method === 'get'){
        newOptions.params = data
    }
    ... 
    
    return axios({ 
        url: fullUrl, 
        ...newOptions,
    }) 
}
```
####  4、请求超时时间
```js
// src/utils/https.js
const defaultOptions = {
  timeout: 15000,
}
```
####  5、允许携带cookie
```js
// src/utils/https.js
const defaultOptions = {
  withCredentials: true,
}
```
####  6、响应结果处理
通过`.then`、`.catch()`处理

这块需要跟服务端约定`接口响应全局码`，从而统一处理`登录校验失败`，`无权限`，`成功`等结果

比如有些服务端对于`登录校验失败`，`无权限`，`成功`等返回的响应码都是200，在响应体内返回的状态码分别是20001，20002，10000，在`then()`中处理

比如有些服务端对于`登录校验失败`，`无权限`，`成功`响应码返回401，403，200，在`catch()`中处理
```js
// src/utils/https.js
import axios from 'axios'
import { Message } from "element-ui";

export const callApi = ({
  ...
}) => {

 ...
 
 return axios({
    url: fullUrl,
    ...newOptions,
  })
    .then((response) => {
      const { data } = response
      if (data.code === 'xxx') {
        // 与服务端约定
        // 登录校验失败
      } else if (data.code === 'xxx') {
        // 与服务端约定
        // 无权限
        router.replace({ path: '/403' })
      } else if (data.code === 'xxx') {
        // 与服务端约定
        return Promise.resolve(data)
      } else {
        const { message } = data
        if (!errorMsgObj[message]) {
          errorMsgObj[message] = message
        }
        setTimeout(debounce(toastMsg, 1000, true), 1000)
        return Promise.reject(data)
      }
    })
    .catch((error) => {
      if (error.response) {
        const { data } = error.response
        const resCode = data.status
        const resMsg = data.message || '服务异常'
        // if (resCode === 401) { // 与服务端约定
        //     // 登录校验失败
        // } else if (data.code === 403) { // 与服务端约定
        //     // 无权限
        //     router.replace({ path: '/403' })
        // }
        if (!errorMsgObj[resMsg]) {
          errorMsgObj[resMsg] = resMsg
        }
        setTimeout(debounce(toastMsg, 1000, true), 1000)
        const err = { code: resCode, respMsg: resMsg }
        return Promise.reject(err)
      } else {
        const err = { type: 'canceled', respMsg: '数据请求超时' }
        return Promise.reject(err)
      }
    })
}
```
上述方案在`Message.error(xx)`时，当多个接口返回的错误信息一致时，会存在`重复提示`的问题，如下图

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5dfffc98a241489d8d06470adb0a94a6~tplv-k3u1fbpfcp-watermark.image)

优化方案，利用`防抖`，实现错误提示一次，更优雅


## 四、完整封装及具体使用
代码可访问[github](https://github.com/zxyue25/axios-[ajax)

#### axios-ajax完整封装
```js
// src/utils/https.js
import axios from 'axios'
import qs from 'qs'
import { debounce } from './debounce'

const contentTypes = {
  json: 'application/json; charset=utf-8',
  urlencoded: 'application/x-www-form-urlencoded; charset=utf-8',
  multipart: 'multipart/form-data',
}

function toastMsg() {
  Object.keys(errorMsgObj).map((item) => {
    Message.error(item)
    delete errorMsgObj[item]
  })
}

let errorMsgObj = {}

const defaultOptions = {
  withCredentials: true, // 允许把cookie传递到后台
  headers: {
    Accept: 'application/json',
    'Content-Type': contentTypes.json,
  },
  timeout: 15000,
}

export const callApi = ({
  url,
  data = {},
  method = 'get',
  options = {},
  contentType = 'json', // json || urlencoded || multipart
  prefixUrl = 'api',
}) => {
  if (!url) {
    const error = new Error('请传入url')
    return Promise.reject(error)
  }
  const fullUrl = `/${prefixUrl}/${url}`

  const newOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      'Content-Type':
        (options.headers && options.headers['Content-Type']) ||
        contentTypes[contentType],
    },
    method,
  }
  if (method === 'get') {
    newOptions.params = data
  }

  if (method !== 'get' && method !== 'head') {
    newOptions.data = data
    if (data instanceof FormData) {
      newOptions.headers = {
        'x-requested-with': 'XMLHttpRequest',
        'cache-control': 'no-cache',
      }
    } else if (newOptions.headers['Content-Type'] === contentTypes.urlencoded) {
      newOptions.data = qs.stringify(data)
    } else {
      Object.keys(data).forEach((item) => {
        if (
          data[item] === null ||
          data[item] === undefined ||
          data[item] === ''
        ) {
          delete data[item]
        }
      })
      // 没有必要，因为axios会将JavaScript对象序列化为JSON
      // newOptions.data = JSON.stringify(data);
    }
  }

  axios.interceptors.request.use((request) => {
    // 移除起始部分 / 所有请求url走相对路径
    request.url = request.url.replace(/^\//, '')
    return request
  })

  return axios({
    url: fullUrl,
    ...newOptions,
  })
    .then((response) => {
      const { data } = response
      if (data.code === 'xxx') {
        // 与服务端约定
        // 登录校验失败
      } else if (data.code === 'xxx') {
        // 与服务端约定
        // 无权限
        router.replace({ path: '/403' })
      } else if (data.code === 'xxx') {
        // 与服务端约定
        return Promise.resolve(data)
      } else {
        const { message } = data
        if (!errorMsgObj[message]) {
          errorMsgObj[message] = message
        }
        setTimeout(debounce(toastMsg, 1000, true), 1000)
        return Promise.reject(data)
      }
    })
    .catch((error) => {
      if (error.response) {
        const { data } = error.response
        const resCode = data.status
        const resMsg = data.message || '服务异常'
        // if (resCode === 401) { // 与服务端约定
        //     // 登录校验失败
        // } else if (data.code === 403) { // 与服务端约定
        //     // 无权限
        //     router.replace({ path: '/403' })
        // }
        if (!errorMsgObj[resMsg]) {
          errorMsgObj[resMsg] = resMsg
        }
        setTimeout(debounce(toastMsg, 1000, true), 1000)
        const err = { code: resCode, respMsg: resMsg }
        return Promise.reject(err)
      } else {
        const err = { type: 'canceled', respMsg: '数据请求超时' }
        return Promise.reject(err)
      }
    })
}
```
```js
// src/utils/debounce.js
export const debounce = (func, timeout, immediate) => {
  let timer

  return function () {
    let context = this
    let args = arguments

    if (timer) clearTimeout(timer)
    if (immediate) {
      var callNow = !timer
      timer = setTimeout(() => {
        timer = null
      }, timeout)
      if (callNow) func.apply(context, args)
    } else {
      timer = setTimeout(function () {
        func.apply(context, args)
      }, timeout)
    }
  }
}
```
#### 具体使用

api管理文件在目录`src/service`下，`index.js`文件暴露其他模块，其他文件按`功能模块划分`文件

get请求带参数
![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/40ca15ccaafc451989a5b7d2ae60895f~tplv-k3u1fbpfcp-watermark.image)
自定义前缀代理不同服务
![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c390bf12036242b495054ba17e22722d~tplv-k3u1fbpfcp-watermark.image)
文件类型处理
![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cd5be0ca5ece4f3da860ef6578407d6e~tplv-k3u1fbpfcp-watermark.image)

## 五、总结
`axios`封装没有一个绝对的标准，且需要结合项目中`实际场景`来设计，但是毋庸置疑，axios-ajax的封装是非常有必要的
