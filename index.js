const express = require('express');
const { URL } = require('url');
const { default: axios } = require('axios');
const cheerio = require('cheerio');
const he = require('he');
const isMobile = require('is-mobile');

const app = express();
const port = process.env.PORT || 1100;

app.set('view engine', 'ejs');

/**
 *
 * @param {string} temp
 * @param {express.Request} req
 * @param {express.Response} res
 */
const tempHandler = (temp, req, res) => {
  const { type, ssl } = req.query;
  let { protocol } = req;
  // 强制使用 https
  if (ssl === '1') {
    protocol = 'https';
  }
  res.type('text/plain');
  res.render(temp, {
    base: `${protocol}://${req.get('host')}`,
    type,
  });
};

app.get('/surge.sgmodule', (req, res) => tempHandler('surge.ejs', req, res));

app.get('/quantumult.conf', (req, res) =>
  tempHandler('quantumult.ejs', req, res)
);

app.get('/browser', (req, res) => res.render('browser.ejs'));

app.get('/:type?/weixin110.qq.com/*', async (req, res) => {
  const ua = req.get('user-agent');
  const url = new URL(
    `https://weixin110.qq.com${req.url.replace(
      new RegExp('(.*)?weixin110.qq.com'),
      ''
    )}`
  );
  url.searchParams.set('main_type', '1');
  let realUrl = url.href;
  const { data } = await axios.get(realUrl);
  if (!data) res.redirect(realUrl);
  const $ = cheerio.load(data);
  try {
    const cgiDataText = $('body script:not([src])')
      .html()
      .replace(new RegExp('(.*)var(\\s)?cgiData(\\s)?=(\\s)'), 'foobar=');
    const cgiData = eval(cgiDataText);
    realUrl = cgiData.url ? he.decode(cgiData.url) : realUrl;
  } catch (error) { }
  if (isMobile({ ua })) {
    // 处理淘宝
    const taobaoDomainList = [
      '^http(s)?://(.*[.])?taobao.com',
      '^http(s)?://(.*[.])?tmall.com',
      '^http(s)?://(.*[.])?tb.cn',
    ];
    if (new RegExp(taobaoDomainList.join('|')).test(realUrl)) {
      if (ua.toLowerCase().includes('micromessenger')) {
        return res.render('browser.ejs');
      }
      realUrl = realUrl.replace(new RegExp('^http(s)?://'), 'taobao://');
    }
  }
  const ip = req.headers['x-forwarded-for'] || 'unknown';
  console.log(`[user: ${ip}] redirect to ${realUrl}`);
  res.redirect(realUrl);
});

app.get('*', (req, res) => {
  res.redirect('https://github.com/baranwang/break-weixin110');
});

app.listen(port, () => {
  console.log(`Express server listening at http://localhost:${port}`);
});

module.exports = app;
