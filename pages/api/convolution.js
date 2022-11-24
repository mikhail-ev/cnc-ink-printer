import Jimp, {getPixelColor} from 'jimp'
import {prepareBase64ForJimp} from "../../lib/base64";

class ConnectedMatrixItem {
    constructor() {
        this.black = false;
        this.blackConnectionsCount = 0;
    }
}

class ConnectedMatrix {
    constructor(width, height, radius) {
        this.cells = {};
        this.radius = radius;
        for (let x = 0; x < width; ++x) {
            this.cells[x] = {};
            for (let y = 0; y < height; ++y) {
                this.cells[x][y] = new ConnectedMatrixItem();
            }
        }
    }

    paint(x, y) {
        if (!this.cells[x] || !this.cells[x][y]) {
            return;
        }
        this.cells[x][y].black = true;
        this.iterateAround(x, y, (item) => {
            item.blackConnectionsCount += 1;
        })
    }

    iterateAround(x, y, callback) {
        const radius = this.radius;
        for (let dx = -radius; dx <= radius; ++dx) {
            if (!this.cells[x + dx]) {
                continue;
            }
            for (let dy = -radius; dy <= radius; ++dy) {
                if (dy === 0 && dx === 0) {
                    continue;
                }
                const xIndex = x + dx;
                const yIndex = y + dy;
                const item = this.cells[xIndex][yIndex];
                if (item) {
                    callback(item);
                }
            }
        }
    }
}

async function defaultAlgorithm(lenna, canvasWidth, canvasHeight, brushSize, resolution) {
    const result = [];
    const horizontalSteps = canvasWidth / resolution;
    const verticalSteps = canvasHeight / resolution;
    const brushRadius = Math.ceil(brushSize / 2 / resolution);
    const brushAffectedPixels = brushSize * brushSize;

    let blackDotsCount = 0;
    let printsCount = 0;

    const startTime = Date.now();
    let diffTime = 0;

    const pixelToStepRatio = lenna.bitmap.width / horizontalSteps; // rename
    const stepToPixelRatio = horizontalSteps / lenna.bitmap.width; // rename
    const mmToPixelRatio = canvasWidth / lenna.bitmap.width;
    const pixelWithResolutionToStepRatio = (lenna.bitmap.width / resolution) / horizontalSteps;

    console.log(`MM to pixel ratio: ${mmToPixelRatio}`);
    console.log(`Image width: ${lenna.bitmap.width}, steps: ${horizontalSteps}, ratio: ${pixelToStepRatio}`)
    console.log(`Image width (corrected for resolution): ${lenna.bitmap.width / resolution}, steps: ${horizontalSteps}, ratio: ${pixelWithResolutionToStepRatio}`)


    // const resizeStartTime = Date.now();
    // lenna.resize(horizontalSteps, Jimp.AUTO);
    // const resizeTime = Date.now() - resizeStartTime;

    const blackPixels = [];

    const black = {r: 0, g: 0, b: 0, a: 255}

    const colorFastMemo = {};
    function isPixelBlackFast(x, y) {
        const diffStartTime = Date.now();
        const index = x.toString() + y.toString();
        if (typeof colorFastMemo[index] !== 'undefined') {
            diffTime += Date.now() - diffStartTime;
            return colorFastMemo[index]
        }
        const color = Jimp.intToRGBA(lenna.getPixelColor(x, y));
        diffTime += Date.now() - diffStartTime;
        const result = color.r + color.g + color.b < 760; // 765 max
        colorFastMemo[index] = result;
        return result
    }

    const colorMemo = {};
    function isPixelBlack(x, y) {
        // return isPixelBlackFast(x,y);
        const diffStartTime = Date.now();
        const index = x.toString() + y.toString();
        if (typeof colorMemo[index] !== 'undefined') {
            diffTime += Date.now() - diffStartTime;
            return colorMemo[index];
        }
        const color = Jimp.intToRGBA(lenna.getPixelColor(x, y));
        const diff = Jimp.colorDiff(color, black);
        const decision = diff < 0.1;
        colorMemo[index] = decision;
        diffTime += Date.now() - diffStartTime;
        return decision
    }

    const imageWidth = lenna.bitmap.width;
    const imageHeight = lenna.bitmap.height;


    for (let x = 0; x < imageWidth; ++x) {
        for (let y = 0; y < imageHeight; ++y) {
            if (!isPixelBlack(x, y)) {
                continue;
            }
            ++blackDotsCount;

            blackPixels.push([x, y]);
        }
    }

    const matrix = new ConnectedMatrix(horizontalSteps, verticalSteps, brushRadius);

    const length = blackPixels.length
    for(let i = 0; i < length; ++i) {
        const [x, y] = blackPixels[i];
        const canvasX = Math.round(x / pixelToStepRatio);
        const canvasY = Math.round(y / pixelToStepRatio);
        if (matrix.cells[canvasX][canvasY].blackConnectionsCount > 0) {
            continue;
        }
        result.push([canvasX * resolution, canvasY * resolution])
        matrix.paint(canvasX, canvasY);
        ++printsCount;
    }


    const endTime = Date.now();
    console.log(
        `Overall dots: ${imageWidth * imageHeight}, black: ${blackDotsCount}, prints: ${printsCount}, elapsed time: ${(endTime - startTime) / 1000}, diff time: ${diffTime / 1000}`
    );
    return result;
}

export default async function handler(req, res) {
    if (req.body.base64 &&
        req.body.algorithm &&
        req.body.resolution &&
        req.body.cwidth &&
        req.body.cheight &&
        req.body.bsize) {
        const algorithm = req.body.algorithm;
        const resolution = req.body.resolution;
        const canvasWidth = req.body.cwidth;
        const canvasHeight = req.body.cheight;
        const brushSize = req.body.bsize;
        const lenna = await Jimp.read(Buffer.from(prepareBase64ForJimp(req.body.base64), 'base64'));

        let result;
        switch (algorithm) {
            case 'DEFAULT':
                result = await defaultAlgorithm(lenna, canvasWidth, canvasHeight, brushSize, resolution);
                break;
            default:
                result = [];
        }
        res.status(200).json({prints: result})
    } else {
        console.log('body was:', JSON.stringify(req.body));
    }
}

export const config = {
    api: {
        responseLimit: false,
        bodyParser: {
            sizeLimit: '12mb' // Set desired value here
        }
    },
}