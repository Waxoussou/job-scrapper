const Job = require('./Job');
const WebLink = require('./WebLink');

describe("JOB CLASS", () => {
    const j = new Job("titre", "company");
    test("should instanciate correctly", () => {
        expect(typeof j).toEqual('object');
    })
    test("link should be of type string", () => {

    })
})

describe("WebLink Class", () => {
    test("should update page param from url", () => {
        const apec_url = new WebLink('APEC');
        expect(apec_url.nextPage().nextPage().searchParams.get('page')).toBe("2");
    })
    test("should update params", () => {
        const url = new WebLink('APEC');
        url.setUrlSearchParams({ key_word: "node", location: 'PARIS' });
        const loc = url.searchParams.get(WebLink.STRUCT_URL.APEC.PARAMS.location)
        const word = url.searchParams.get(WebLink.STRUCT_URL.APEC.PARAMS.key_word)
        expect(word).toBe("node");
        expect(loc).toBe("75");
    })
})