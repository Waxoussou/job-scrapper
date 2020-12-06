module.exports = {
    // URL: "https://www.apec.fr/candidat/recherche-emploi.html/emploi?motsCles=&sortsType=DATE&page=&lieux=",
    URL: "https://www.chooseyourboss.com/offres/emploi-{what}-{where}",

    PARAMS: {
        type: "BY_PATHNAME",
        key_word: /%7Bwhat%7D/,
        location: /%7Bwhere%7D/,
        page: "page",
        // sort_type: "sortsType",
    },

}