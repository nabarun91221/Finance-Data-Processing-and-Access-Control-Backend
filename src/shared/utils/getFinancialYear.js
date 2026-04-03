const getFinancialYear = () =>
{
    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    let startYear;

    if (month >= 4) {
        // After financial year start (April)
        startYear = year;
    } else {
        // Jan–Mar belong to previous financial year
        startYear = year - 1;
    }

    const endYear = startYear + 1;

    return `${startYear}-${endYear}`;
}

export default getFinancialYear;