"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const transform_utils_1 = require("../../utils/transform.utils");
const mocha_1 = require("mocha");
(0, mocha_1.describe)('Data Sorter', () => {
    const transform = transform_utils_1.DataTransformManager;
    (0, mocha_1.it)('should correctly sort data by type and then by name', () => {
        const inputData = [
            { name: 'a', path: 'a', type: '.md', content: '' },
            // @ts-ignore
            { name: 'b', path: 'b', type: '.txt', content: '' },
            { name: 'c', path: 'c', type: '.md', content: '' },
            // @ts-ignore
            { name: 'f', path: 'f', type: '.rtf', content: '' },
            { name: 'r', path: 'r', type: '.bpmn', content: '' },
            { name: 'e', path: 'e', type: '.md', content: '' },
            { name: 'p', path: 'p', type: '.md', content: '' },
            { name: 'm', path: 'm', type: '.bpmn', content: '' },
            { name: 'l', path: 'l', type: '.bpmn', content: '' },
        ];
        const sortedData = transform.sortDataByTypeAndName(inputData);
        const expectedData = [
            { name: 'l', path: 'l', type: '.bpmn', content: '' },
            { name: 'm', path: 'm', type: '.bpmn', content: '' },
            { name: 'r', path: 'r', type: '.bpmn', content: '' },
            { name: 'a', path: 'a', type: '.md', content: '' },
            { name: 'c', path: 'c', type: '.md', content: '' },
            { name: 'e', path: 'e', type: '.md', content: '' },
            { name: 'p', path: 'p', type: '.md', content: '' },
            // @ts-ignore
            { name: 'f', path: 'f', type: '.rtf', content: '' },
            // @ts-ignore
            { name: 'b', path: 'b', type: '.txt', content: '' },
        ];
        (0, chai_1.expect)(sortedData).to.deep.equal(expectedData);
    });
    (0, mocha_1.it)('should remove params from an url', () => {
        const url = 'https://test.com/test?param1=1&param2=2';
        const expectedUrl = 'https://test.com/test';
        const result = transform.removeQueryParamsFromUrl(url);
        (0, chai_1.expect)(result).to.equal(expectedUrl);
    });
});
//# sourceMappingURL=transform.test.js.map