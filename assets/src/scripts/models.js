const { timeFormat } = require('d3-time-format');


// Define Water Services root URL - use global variable if defined, otherwise
// use production.
const SERVICE_ROOT = window.SERVICE_ROOT || 'https://waterservices.usgs.gov/nwis';

// Create a time formatting function from D3's timeFormat
const formatTime = timeFormat('%c %Z');


/**
 * Simple XMLHttpRequest wrapper.
 * @param  {String}   url      URL to retrieve
 * @param  {Function} callback Callback function to call with (data, error)
 */
function get(url, callback) {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            let data;
            try {
                data = JSON.parse(xmlhttp.responseText);
            } catch(err) {
                callback(null, err.message);
            }
            callback(data);
        }
    };

    xmlhttp.open('GET', url, true);
    xmlhttp.send();
}


/**
 * Get a given timeseries dataset from Water Services.
 * @param  {Array}    sites  Array of site IDs to retrieve.
 * @param  {Array}    params List of parameter codes
 * @param  {Function} callback       Callback to be called with (data, error)
 */
export function getTimeseries({sites, params=['00060']}, callback) {
    let url = `${SERVICE_ROOT}/iv/?sites=${sites.join(',')}&parameterCd=${params.join(',')}&period=P7D&indent=on&siteStatus=all&format=json`;
    get(url, (data, error) => {
        if (error) {
            callback(null, error || 'Unexpected error');
        }
        callback(data.value.timeSeries.map(series => {
            let startDate = new Date(series.values[0].value[0].dateTime);
            let endDate = new Date(series.values[0].value.slice(-1)[0].dateTime);
            return {
                code: series.variable.variableCode[0].value,
                variableName: series.variable.variableName,
                variableDescription: series.variable.variableDescription,
                seriesStartDate: formatTime(startDate),
                seriesEndDate: formatTime(endDate),
                values: series.values[0].value.map(value => {
                    let date = new Date(value.dateTime);
                    return {
                        time: date,
                        value: parseFloat(value.value),
                        label: `${formatTime(date)}\n${value.value} ${series.variable.unit.unitCode}`
                    };
                })
            };
        }));
    });
}
