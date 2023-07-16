require('dotenv').config()

const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

// 毎日のんびり日本語教師
const GRAMMAR_URL = "https://nihongonosensei.net/?page_id=10246";
const SAVE_FILENAME = process.env.SAVE_FILENAME;

if (fs.existsSync(SAVE_FILENAME)) {
    fs.unlinkSync(SAVE_FILENAME)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async function () {
    let data = await home();
    for (const d of data) {
        console.log(d.tag, d.question);
        sleep(Math.ceil(Math.random() * 100))
        let answer = await page(d.url);
        fs.appendFileSync(SAVE_FILENAME, `${d.question};${answer};${d.tag}\n`)
    }
})()

async function page(url) {
    let response = await axios.get(url)
    const $ = cheerio.load(response.data);
    $("table").remove()
    $("span, p").removeAttr("style")
    $("img").remove()
    return $("article .clearfix").html().replaceAll("\n", "");
}

async function home() {
    let response = await axios.get(GRAMMAR_URL)
    const $ = cheerio.load(response.data);

    let data = [];
    $("#mouseover1").each(function (index) {
        if (![1, 2, 3, 4].includes(index)) {
            return
        }
        let tag = `N${index + 1}`
        if (index === 4) {
            tag = "N4,N5";
        }
        $(this).find("td a").each(function (index) {
            let question = `${$(this).text()}（${$(this).parent().next().text()}）`;
            let url = $(this).attr().href;
            data.push({
                question,
                url,
                tag,
            });
        })
    })
    return data;
}
