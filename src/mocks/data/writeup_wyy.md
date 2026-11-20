# 网易云搜索接口逆向

**本文仅供学习交流，请勿用于非法用途**

## 1 寻找数据包
在网易云搜索页面打开开发者工具，输入音乐名便可以抓到如下数据。

![](./assets/writeup_wyy-1795144249252.png)


这个数据包就是搜索接口。

## 2 定位加密参数位置

![](./assets/writeup_wyy-1795143634446.png)

分析参数，我们目前需要拿到`params`和`encSecKey`这两个参数的值。

![](./assets/writeup_wyy-1795144277021.png)

因为这个请求是XHR请求，所以我们先对这个请求打一个XHR断点。
网址包含`cloudsearch/get/web`

![](./assets/writeup_wyy-1795144470100.png)

![](./assets/writeup_wyy-1795144640368.png)

此时断点断在这里

![](./assets/writeup_wyy-1795144921772.png)

分析调用堆栈，发现当堆栈在这里时找到了加密参数。

![](./assets/writeup_wyy-1795144949404.png)

```javascript
var bVn8q = window.asrsea(JSON.stringify(i4O), bxr6u(["流泪", "强"]), bxr6u(BH4a.md), bxr6u(["爱心", "女孩", "惊恐", "大笑"]));
e6y.data = j0C.cp2C({
    params: bVn8q.encText,
    encSecKey: bVn8q.encSecKey
})
```

分析js代码发现， `params`和`encSecKey`是对象`bVn8q`里的字段。

![](./assets/writeup_wyy-1795145610844.png)

在这个位置打断点，在控制台里依次执行`bxr6u(["流泪", "强"])`，`bxr6u(BH4a.md)`，`bxr6u(["爱心", "女孩", "惊恐", "大笑"])`函数。

![](./assets/writeup_wyy-1795145808758.png)

发现这些都是固定值。
在控制台执行`JSON.stringify(i4O)`，发现输出了一个字符串，执行i40，返回了一个json。

```json
{
    "hlpretag": "<span class=\"s-fc7\">",
    "hlposttag": "</span>",
    "id": "54668883",
    "s": "红昭愿",
    "type": "1",
    "offset": "0",
    "total": "true",
    "limit": "30",
    "csrf_token": "34ca2c0f1a41535a27da93b48611edd7"
}
```

`csrf_token`就是接口的字符串参数,s就是我们输入的音乐名。

在当前页面搜索`asrsea`,找到下列代码。

![](./assets/writeup_wyy-1795146685321.png)

js代码如下

```javascript
function a(a) {
    var d, e, b = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", c = "";
    for (d = 0; a > d; d += 1)
        e = Math.random() * b.length,
        e = Math.floor(e),
        c += b.charAt(e);
    return c
}
function b(a, b) {
    var c = CryptoJS.enc.Utf8.parse(b)
      , d = CryptoJS.enc.Utf8.parse("0102030405060708")
      , e = CryptoJS.enc.Utf8.parse(a)
      , f = CryptoJS.AES.encrypt(e, c, {
        iv: d,
        mode: CryptoJS.mode.CBC
    });
    return f.toString()
}
function c(a, b, c) {
    var d, e;
    return setMaxDigits(131),
    d = new RSAKeyPair(b,"",c),
    e = encryptedString(d, a)
}
function d(d, e, f, g) {
    var h = {}
      , i = a(16);
    return h.encText = b(d, g),
    h.encText = b(h.encText, i),
    h.encSecKey = c(i, e, f),
    h
}
function e(a, b, d, e) {
    var f = {};
    return f.encText = c(a + e, b, d),
    f
}
window.asrsea = d
```

## 3 分析js加密逻辑
### 1.函数a -伪随机

  作用：生成一个长度为 a 的随机字符串。

  字符集：a-z A-Z 0-9（62个字符）。

  实现：每次 Math.random() * 62 取整，从字符集中取一个字符。

### 2.函数b -AES加密

参数：a = 明文，b = 密钥（16字节字符串）。

密钥：b 用 UTF-8 解析成 16 字节。

IV：固定为 "0102030405060708"（16 字节）。

模式：CBC。

填充：CryptoJS 默认使用 PKCS7 填充。

返回：f.toString() 返回 Base64 编码的密文（CryptoJS 默认输出 Base64）。

### 3.函数c -RSA加密

这是 RSA 加密，使用的是经典的 RSAKeyPair + encryptedString（来自 RSA.js，即 Barrett 约简实现）。

b = 公钥指数（exponent，通常是 "010001"）。

c = 模数（modulus，十六进制字符串）。

a = 明文（这里是 16 位随机字符串 i）。

encryptedString 返回的是 十六进制字符串（不是 Base64）

注:这里RSA是非标准填充（不是 PKCS#1 v1.5，而是它自己实现的"反转 + 填充"），需要手动实现 encryptedString 的填充逻辑。当时笔者使用python的Crypto库自动填充就是因为这个问题排查了半天。

### 4.函数d -主加密

流程：

i = a(16) → 生成 16 位随机字符串（作为第二层 AES 密钥）。

h.encText = b(d, g) → 用固定密钥 g 对明文 d 做 AES-CBC 加密，得到 Base64 字符串。

h.encText = b(h.encText, i) → 再用随机密钥 i 对上一次的 Base64 结果做 AES-CBC 加密，得到最终 encText。

h.encSecKey = c(i, e, f) → 用 RSA 公钥加密随机密钥 i，得到 encSecKey。

python代码复现。

```python
import base64
import random
import string
from Cryptodome.Cipher import AES
from Cryptodome.Util.Padding import pad

# ============ 1. 随机字符串生成（对应 JS 的 a 函数） ============
def random_string(length=16):
    chars = string.ascii_letters + string.digits  # a-z A-Z 0-9
    return ''.join(random.choice(chars) for _ in range(length))


# ============ 2. AES-CBC 加密（对应 JS 的 b 函数） ============
def aes_encrypt(text: str, key: str) -> str:
    """
    AES-128-CBC + PKCS7 填充，返回 Base64 字符串。
    key 必须是 16 字节（UTF-8），IV 固定为 '0102030405060708'。
    """
    key_bytes = key.encode('utf-8')
    iv_bytes = b'0102030405060708'
    data_bytes = text.encode('utf-8')

    cipher = AES.new(key_bytes, AES.MODE_CBC, iv_bytes)
    encrypted = cipher.encrypt(pad(data_bytes, AES.block_size))
    return base64.b64encode(encrypted).decode('utf-8')


# ============ 3. RSA 加密（对应 JS 的 encryptedString） ============
# 网易云的 RSA 不是标准 PKCS#1，需要手动实现它的填充逻辑。
# 这里用纯 Python 复现 RSA.js 中 encryptedString 的行为。

def rsa_encrypt(text: str, exponent: str, modulus: str) -> str:
    """
    复现 RSA.js 的 encryptedString：
      - text 反转后逐字符转 charCode
      - 按块进行模幂运算
      - 输出十六进制字符串（每块补齐到模数长度）
    """
    # 1. 明文反转
    reversed_text = text[::-1]

    # 2. 解析公钥
    e = int(exponent, 16)
    n = int(modulus, 16)

    # 3. 计算模数字节长度（用于补齐）
    mod_len = (n.bit_length() + 7) // 8
    # RSA.js 中 hex 输出长度 = mod_len * 2

    # 4. 分块加密：RSA.js 每次处理 (mod_len - 1) 个字符
    #    但网易云明文只有 16 字符，mod_len 通常 128，所以一块就够。
    #    这里按通用方式分块处理。
    chunk_size = mod_len - 1  # RSA.js 的 maxDigits 逻辑对应约 mod_len-1
    result_hex = ''

    for i in range(0, len(reversed_text), chunk_size):
        chunk = reversed_text[i:i + chunk_size]
        # 把字符转成整数：高位在前（对应 RSA.js 的 charCodeAt 拼接）
        m = 0
        for ch in chunk:
            m = (m << 8) | ord(ch)
        # 模幂
        c = pow(m, e, n)
        # 转十六进制并补齐到 mod_len*2 位
        result_hex += format(c, 'x').zfill(mod_len * 2)

    return result_hex


# ============ 4. 主函数（对应 JS 的 d / window.asrsea） ============
def asrsea(d: str, e: str, f: str, g: str) -> dict:
    """
    d: 明文
    e: RSA 公钥指数（如 '010001'）
    f: RSA 模数（十六进制字符串）
    g: 第一层 AES 密钥（如 '0CoJUm6Qyw8W8jud'）
    """
    i = random_string(16)                       # 随机 16 位密钥
    enc_text = aes_encrypt(d, g)                # 第一层 AES
    enc_text = aes_encrypt(enc_text, i)         # 第二层 AES
    enc_sec_key = rsa_encrypt(i, e, f)          # RSA 加密随机密钥
    return {
        'encText': enc_text,
        'encSecKey': enc_sec_key,
    }
```

## 4 python构建请求。

构造python请求应该就不用过多赘述了，这里是python完整代码。

```python
import requests
import base64
import random
import string
from Cryptodome.Cipher import AES
from Cryptodome.Util.Padding import pad
import json

# ============ 1. 随机字符串生成（对应 JS 的 a 函数） ============
def random_string(length=16):
    chars = string.ascii_letters + string.digits  # a-z A-Z 0-9
    return ''.join(random.choice(chars) for _ in range(length))


# ============ 2. AES-CBC 加密（对应 JS 的 b 函数） ============
def aes_encrypt(text: str, key: str) -> str:
    """
    AES-128-CBC + PKCS7 填充，返回 Base64 字符串。
    key 必须是 16 字节（UTF-8），IV 固定为 '0102030405060708'。
    """
    key_bytes = key.encode('utf-8')
    iv_bytes = b'0102030405060708'
    data_bytes = text.encode('utf-8')

    cipher = AES.new(key_bytes, AES.MODE_CBC, iv_bytes)
    encrypted = cipher.encrypt(pad(data_bytes, AES.block_size))
    return base64.b64encode(encrypted).decode('utf-8')


# ============ 3. RSA 加密（对应 JS 的 encryptedString） ============
# 网易云的 RSA 不是标准 PKCS#1，需要手动实现它的填充逻辑。
# 这里用纯 Python 复现 RSA.js 中 encryptedString 的行为。


def rsa_encrypt(text: str, exponent: str, modulus: str) -> str:
    """
    复现 RSA.js 的 encryptedString：
      - text 反转后逐字符转 charCode
      - 按块进行模幂运算
      - 输出十六进制字符串（每块补齐到模数长度）
    """
    # 1. 明文反转
    reversed_text = text[::-1]

    # 2. 解析公钥
    e = int(exponent, 16)
    n = int(modulus, 16)

    # 3. 计算模数字节长度（用于补齐）
    mod_len = (n.bit_length() + 7) // 8
    # RSA.js 中 hex 输出长度 = mod_len * 2

    # 4. 分块加密：RSA.js 每次处理 (mod_len - 1) 个字符
    #    但网易云明文只有 16 字符，mod_len 通常 128，所以一块就够。
    #    这里按通用方式分块处理。
    chunk_size = mod_len - 1  # RSA.js 的 maxDigits 逻辑对应约 mod_len-1
    result_hex = ''

    for i in range(0, len(reversed_text), chunk_size):
        chunk = reversed_text[i:i + chunk_size]
        # 把字符转成整数：高位在前（对应 RSA.js 的 charCodeAt 拼接）
        m = 0
        for ch in chunk:
            m = (m << 8) | ord(ch)
        # 模幂
        c = pow(m, e, n)
        # 转十六进制并补齐到 mod_len*2 位
        result_hex += format(c, 'x').zfill(mod_len * 2)

    return result_hex


# ============ 4. 主函数（对应 JS 的 d / window.asrsea） ============
def asrsea(d: str, e: str, f: str, g: str) -> dict:
    """
    d: 明文
    e: RSA 公钥指数（如 '010001'）
    f: RSA 模数（十六进制字符串）
    g: 第一层 AES 密钥（如 '0CoJUm6Qyw8W8jud'）
    """
    i = random_string(16)                       # 随机 16 位密钥
    enc_text = aes_encrypt(d, g)                # 第一层 AES
    enc_text = aes_encrypt(enc_text, i)         # 第二层 AES
    enc_sec_key = rsa_encrypt(i, e, f)          # RSA 加密随机密钥
    return {
        'encText': enc_text,
        'encSecKey': enc_sec_key,
    }

def get_page():
    MODULUS = (
        "00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7"
        "b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280"
        "104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932"
        "575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b"
        "3ece0462db0a22b8e7"
    )
    EXPONENT = "010001"
    AES_KEY = "0CoJUm6Qyw8W8jud"
    Json = {
    "hlpretag": "<span class=\"s-fc7\">",
    "hlposttag": "</span>",
    "id": "54668883",
    "s": "红昭愿",
    "type": "1",
    "offset": "0",
    "total": "true",
    "limit": "30",
    "csrf_token": "34ca2c0f1a41535a27da93b48611edd7"
}
    plaintext = json.dumps(Json, separators=(',', ':'), ensure_ascii=False)
    result = asrsea(plaintext, EXPONENT, MODULUS, AES_KEY)
    url = 'https://music.163.com/weapi/cloudsearch/get/web?csrf_token=34ca2c0f1a41535a27da93b48611edd7'
    params = {
        'csrf_token': Json['csrf_token'],
    }
    data = {
        'params': result['encText'],
        'encSecKey': result['encSecKey'],
    }
    headers = {
        'cookie':'你的cookie,自行抓包获取',
        'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36',
        'referer':'https://music.163.com/search/'
    }
    res = requests.post(url, params=params, data=data, headers=headers).json()
    print(res)
    
    
get_page()
```



