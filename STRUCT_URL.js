module.exports = {
    APEC: {
        URL: "https://www.apec.fr/candidat/recherche-emploi.html/emploi",
        PARAMS: {
            key_word: "motsCles",
            page: 'page',
            location: 'lieux',
            sort_type: 'sortsType'
        },
        URL_STRUCTURE: {
            url: "https://www.apec.fr/candidat/recherche-emploi.html/emploi",
            key_word: "?motsCles=",
            sort_type: "&sortsType=DATE",
            page: "&page=",
            lieux: "&lieux="
        },
        CODE_LIEUX: {
            PARIS: 75,
            TOULOUSE: 572357,
            OCCITANIE: 20076,
        }
    }
}