const getPage = async (browser) => {
    const page = (await browser.pages())[0];
    return page;
}

module.exports = { getPage };




