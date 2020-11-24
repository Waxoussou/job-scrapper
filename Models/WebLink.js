const STRUCT_URL = require('../STRUCT_URL');

class WebLink extends URL {
    static STRUCT_URL = STRUCT_URL;

    constructor(website) {
        super(STRUCT_URL[website.toUpperCase()].URL);
        this.website = website.toUpperCase();
    }

    setUrlSearchParams(search_params) {
        if (search_params) {
            Object.keys(search_params).map(param => {
                const new_param = param === 'location' ?
                    STRUCT_URL.APEC.CODE_LIEUX[(search_params[param]).toUpperCase()] :
                    search_params[param]
                this.searchParams.set(STRUCT_URL.APEC.PARAMS[param], new_param)
            })
        }
        return this;
    }

    nextPage() {
        let current_page = this.searchParams.get('page');
        current_page++;
        this.searchParams.set('page', current_page);
        return this
    }

}

module.exports = WebLink;