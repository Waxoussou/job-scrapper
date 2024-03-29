class Job {
    constructor(title, company, details, link, source) {
        this.source = source;
        this.title = title;
        this.company = company;
        this.details = details || {};
        this.days_since_publication = this.details.date_of_publication ? this.#handleDateString(details.date_of_publication) : null;
        this.link = link;
    }

    #handleDateString = (dateString) => {
        dateString = typeof dateString === 'string' ? dateString.trim() : dateString
        let publish_date = new Date(dateString);
        if (publish_date === 'Invalid Date') {
            const is_date = this.#isDate(dateString);
            publish_date = is_date && this.#takeFrenchDateFormatToUSFormatDate(dateString);
        }
        return this.#getDaysSincePublication(publish_date);
    }

    #isDate = (string) => {
        const regexp = /^((\d{2})[-.,\/]){2}(\d{2,4}$)/
        return regexp.test(string)
    }

    #takeFrenchDateFormatToUSFormatDate = (date) => {
        const us_date_format = this.#reverseDate(date);
        return new Date(us_date_format);
    }

    #reverseDate = (string) => {
        return string.split("/").reverse().join('-')
    }

    #getDaysSincePublication = (date) => {
        const now = new Date();
        return this.#getElapsedDaysBetweenTwoDates(now, date);
    }

    #getElapsedDaysBetweenTwoDates = (d1, d2) => {
        const diff = d1.getTime() - d2.getTime()
        return (diff / 86400000).toFixed(2)
    }

    hasPublicationDate = () => {
        if (!this.days_since_publication) return false;
        return true
    }
}


module.exports = Job;