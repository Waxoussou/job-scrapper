const STRUCT_URL = require('../STRUCT_URL');

class WebLink extends URL {
    static STRUCT_URL = STRUCT_URL;

    constructor(website) {
        super(website);
        this.website = this.getWebNameFromPathUrl();
    }

    getWebNameFromPathUrl = () => {
        const regexp = /(?<=\.).*(?=\.)/;
        const webname = this.host.match(regexp);
        return webname[0].toUpperCase();
    }

    setUrlSearchParams(search_params) {
        if (search_params) {
            Object.keys(search_params).map(param => {
                const new_param = param === 'location' ?
                    this.checkForSpecificSettings(search_params[param]) :
                    // STRUCT_URL[this.website].CODE_LIEUX[(search_params[param]).toUpperCase()] :
                    search_params[param]
                this.searchParams.set(STRUCT_URL[this.website].PARAMS[param], new_param)
            })
        }
        return this;
    }

    checkForSpecificSettings = (search_param) => {
        const code_location = STRUCT_URL[this.website].CODE_LIEUX;
        if (!code_location) return search_param
        return code_location[search_param.toUpperCase()];
    }

    nextPage() {
        let current_page = this.searchParams.get('page');
        current_page++;
        this.searchParams.set('page', current_page);
        return this;
    }

}

module.exports = WebLink;