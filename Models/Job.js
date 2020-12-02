class Job {
    constructor(title, company, details, link) {
        this.title = title;
        this.company = company;
        this.details = details || {};
        this.days_since_publication = this.details.date_of_publication ? this.#handleDateString(details.date_of_publication.trim()) : null;
        this.link = link;
    }

    #handleDateString = (dateString) => {
        const is_date = this.#isDate(dateString);
        if (is_date) {
            const publish_date = this.#takeFrenchDateFormatToUSFormatDate(dateString);
            return this.#getDaysSincePublication(publish_date);
        }
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