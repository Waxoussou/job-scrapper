const Job = require('./Job');
const WebLink = require('./WebLink');
const Scrapper = require('./Scrapper');

describe("CLASS Job", () => {
    const j = new Job("titre", "company");
    test("should instanciate correctly", () => {
        expect(typeof j).toEqual('object');
    })
    test("link should be of type string", () => {

    })
})

describe("CLASS WebLink", () => {
    test.skip("should update page param from url", () => {
        const apec_url = new WebLink('APEC');
        expect(apec_url.nextPage().nextPage().searchParams.get('page')).toBe("2");
    })
    test.skip("should update params", () => {
        const url = new WebLink('APEC');
        url.setUrlSearchParams({ key_word: "node", location: 'PARIS' });
        const loc = url.searchParams.get(WebLink.STRUCT_URL.APEC.PARAMS.location)
        const word = url.searchParams.get(WebLink.STRUCT_URL.APEC.PARAMS.key_word)
        expect(word).toBe("node");
        expect(loc).toBe("75");
    })

    describe("should render search param location according to specific settings ", () => {
        test("apec => should render a specific code location used on Apec", () => {
            const url = new WebLink("http://www.apec.com");
            const search_param = { location: "toulouse" };
            url.setUrlSearchParams(search_param);
            console.log(url.href)
            const loc = url.searchParams.get("lieux");
            expect(loc).toBe("572357");
        })
        test("meteojob : no specific location settings => should render as indicate from client", () => {
            const url = new WebLink("http://www.meteojob.com");
            const search_param = { location: "toulouse" };
            url.setUrlSearchParams(search_param);
            console.log(url.href)
            const loc = url.searchParams.get("where");
            expect(loc).toBe("toulouse");

        })

    })
})


describe.skip("CLASS Scrapper", () => {
    test('should be able to setup and lauch browser ', () => {
        const options = { key_word: "react", location: "toulouse" };
        const scrapper = new Scrapper();
        expect(scrapper).toHaveProperty("browserInstance");
        expect(scrapper).toHaveProperty("options");
        expect(scrapper.browserInstance).not.toBe(null)
        scrapper.setUp(options)
        expect(scrapper).toBeInstanceOf(Scrapper)
        expect(scrapper.options).toEqual(options);

    })
})