const { prepareUrl, navigateNextPage } = require('./utils');
const { APEC } = require('./settings');

describe("prepareUrl Function", () => {
    test("should return standard url from selected website", () => {
        const url = prepareUrl('APEC');
        expect(typeof url).toBe("object");
        expect(typeof url.href).toBe("string");
        expect(url.href).toBe(APEC.URL);
    })
    test('should increment page param of 1', () => {
        const url = prepareUrl('APEC', { page: 0 });
        let page = url.searchParams.get(APEC.SEARCH_PARAMS.page)
        const next_url = navigateNextPage(url);
        expect(next_url.searchParams.get(APEC.SEARCH_PARAMS.page)).toBe("1")
    })
})