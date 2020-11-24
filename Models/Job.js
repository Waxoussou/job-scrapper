class Job {
    constructor(title, company, details, link) {
        this.title = title;
        this.company = company;
        this.details = details || {};
        this.diff = this.details.date_of_publication ? this.#handleDateString(details.date_of_publication.trim()) : null;
        this.link = link;
    }

    #handleDateString = (dateString) => {
        const is_date = this.#isDate(dateString);
        console.log({ is_date });
        if (is_date) {
            const now = new Date();
            const publish_date = new Date(this.#reverseDate(dateString));

            return this.#getDayDiffFromDates(now, publish_date);
        }
    }

    #isDate = (string) => {
        const regexp = /^((\d{2})[-.,\/]){2}(\d{2,4}$)/
        console.log(regexp.test(string))
        return regexp.test(string)
    }

    #reverseDate = (string) => {
        return string.split("/").reverse().join('-')
    }

    #getDayDiffFromDates = (d1, d2) => {
        const diff = d1.getTime() - d2.getTime()
        return (diff / 86400000).toFixed(2)
    }
}


module.exports = Job;