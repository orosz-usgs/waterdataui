const { extent } = require('d3-array');
const { scaleLinear, scaleTime } = require('d3-scale');
const { createSelector } = require('reselect');

const { WIDTH, HEIGHT, MARGIN } = require('./layout');

const paddingRatio = 0.2;


/**
 *  Return domainExtent padded on both ends by paddingRatio
 *  @param {Array} domainExtent - array of two numbers
 *  @return {Array} - array of two numbers
 */
function extendDomain(domainExtent) {
    const padding = paddingRatio * (domainExtent[1] - domainExtent[0]);
    return [domainExtent[0] - padding, domainExtent[1] + padding];
}

/**
 * Create an x-scale oriented on the left
 * @param {Array} data - Array contains {time, ...}
 * @param {Number} xSize - range of scale
 * @eturn {Object} d3 scale for time.
 */
function createXScale(values, xSize) {
    // Calculate max and min for values
    const xExtent = values.length ? extent(values, d => d.time) : [0, 1];

    // xScale is oriented on the left
    return scaleTime()
        .range([0, xSize])
        .domain(xExtent);
}

/**
 * Create an yscale oriented on the bottom
 * @param {Array} tsData - Array contains {value, ...}
 * @param {Number} xSize - range of scale
 * @eturn {Object} d3 scale for value.
 */
function createYScale(tsData, ySize) {
    let yExtent;

    // Calculate max and min for data
    for (let key of Object.keys(tsData)) {
        if (!tsData[key].show || tsData[key].data.length === 0) {
            continue;
        }

        const thisExtent = extent(tsData[key].data, d => d.value);
        if (yExtent !== undefined) {
            yExtent = [
                Math.min(thisExtent[0], yExtent[0]),
                Math.max(thisExtent[1], yExtent[1])
            ];
        } else {
            yExtent = thisExtent;
        }
    }

    // Add padding to the extent and handle empty data sets.
    if (yExtent) {
        yExtent = extendDomain(yExtent);
    } else {
        yExtent = [0, 1];
    }

    // yScale is oriented on the bottom
    return scaleLinear()
        .range([ySize, 0])
        .domain(yExtent);
}

/**
 * Create scales for hydrograph charts. X is linear to time and Y is logarithmic.
 * @param  {Array} data    Array containing {time, value} items
 * @param  {Number} xSize X range of scale
 * @param  {Number} ySize Y range of scale
 * @return {Object}        {xScale, yScale}
 */
function createScales(tsData, xSize, ySize) {
    const xScale = createXScale(tsData.current.data, xSize);
    const yScale = createYScale(tsData, ySize);

    return {xScale, yScale};
}


const xScaleSelector = createSelector(
    (state) => state.tsData,
    (state, tsDataKey = 'current') => tsDataKey,
    (tsData, tsDataKey) => {
        if (tsData[tsDataKey]) {
            return createXScale(tsData[tsDataKey].data, WIDTH - MARGIN.right);
        } else {
            return null;
        }
    }
);


const yScaleSelector = createSelector(
    (state) => state.tsData,
    (tsData) => createYScale(tsData, HEIGHT - (MARGIN.top + MARGIN.bottom))
);


module.exports = {createScales, xScaleSelector, yScaleSelector};
