const fs = require('fs');
const es = require('event-stream');
const JSONStream = require('JSONStream');
const dataFigma = [];

const removeUndefinedObjects = (array) => {
    return array.filter(obj => Object.keys(obj)[0] !== "undefined");
}

const arrayToObject = (array) => {
    let result = {};
    array.forEach(obj => {
        const key = Object.keys(obj)[0];
        if (key !== "undefined") {
            result[key] = obj[key];
        }
    });
    return result;
}

const getStream = () => {
    const stream = fs.createReadStream('./data/output.json', { encoding: 'utf8' });
    // Parse the JSON stream
    // {
    //     componentSets: {...},
    //     components: {...},
    //     styles: {...}
    // }
    const parser = JSONStream.parse('componentSets.*');

    return stream.pipe(parser);
};

getStream()
    .pipe(es.mapSync(function (data) {
        const component = {
            [data.name]: {
                key: data.key,
            }
        }

        dataFigma.push(component);
    }))
    .on('end', () => {
        const transformData = arrayToObject(removeUndefinedObjects(dataFigma.flat(Infinity)))

        fs.writeFileSync('data/componentSets.json', JSON.stringify(transformData), (err) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log('Write success');
        })
    });