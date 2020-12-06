const STRUCT_URL = require('../STRUCT_URL');

class WebLink extends URL {
    static STRUCT_URL = STRUCT_URL;

    constructor(website) {
        super(website);
        this.website = this.getWebNameFromPathUrl();
        this.config = STRUCT_URL[this.website]
    }

    getWebNameFromPathUrl = () => {
        const regexp = /(?<=\.).*(?=\.)/;
        const webname = this.host.match(regexp);
        return webname[0].toUpperCase();
    }

    setUrlSearchParams(search_params) {
        if (search_params) {
            Object.keys(search_params).map(param => {
                const new_param = this.getNewParamFromConfig(param, search_params[param]);
                this.setSearchParams(param, new_param)
            })
        }
        return this;
    }

    getNewParamFromConfig = (param, value) => {
        return param === 'location' ?
            this.checkForSpecificSettings(value) :
            value
    }

    checkForSpecificSettings = (search_param) => {
        const code_location = this.config.CODE_LIEUX;
        if (!code_location) return search_param
        return code_location[search_param.toUpperCase()];
    }

    setSearchParams = (param, value) => {
        switch (this.config.PARAMS.type) {
            case 'BY_PATHNAME':
                this.setSearchParamsByPathname(param, value)
                break;
            default:
                this.searchParams.set(this.config.PARAMS[param], value)
                break;
        }
    }

    setSearchParamsByPathname = (param, value) => {
        const regexp = this.config.PARAMS[param];
        this.pathname = this.pathname.replace(regexp, value.trim())
    }

    nextPage() {
        let current_page = this.searchParams.get('page') || "1";

        current_page++;

        this.searchParams.set('page', current_page);
        return this;
    }

}

module.exports = WebLink;