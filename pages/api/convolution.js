import Jimp, {getPixelColor} from 'jimp'
import {prepareBase64ForJimp} from "../../lib/base64";

async function defaultAlgorithm(lenna, canvasWidth, canvasHeight, brushSize, resolution) {
    const result = [];
    const fillMatrix = {};
    const horizontalSteps = canvasWidth / resolution;
    const verticalSteps = canvasHeight / resolution;
    const brushRadius = Math.ceil(brushSize / 2) * 6;

    let blackDotsCount = 0;
    let printsCount = 0;

    const startTime = Date.now();
    let diffTime = 0;

    lenna.resize(horizontalSteps, Jimp.AUTO);

    const black = { r: 0, g: 0, b: 0, a: 255 }

    function isPixelBlack(x, y) {
        const color = Jimp.intToRGBA(lenna.getPixelColor(x, y));
        const diffStartTime = Date.now();
        const diff = Jimp.colorDiff(color, black);
        const diffEndTime = Date.now();
        diffTime+= diffEndTime - diffStartTime;
        return diff < 0.5
    }

    for(let x = 0; x < horizontalSteps; ++x) {
        for(let y = 0; y < verticalSteps; ++y) {
            if (!isPixelBlack(x, y)) {
                 continue;
            }
            ++blackDotsCount;

            let filledSpotsInArea = 0;
            for(let bx = -brushRadius; bx <= brushRadius; ++bx) {
                const xPosition = x + bx;
                fillMatrix[xPosition] = fillMatrix[xPosition] || {}
                for(let by = -brushRadius; by <= brushRadius; ++by) {
                    const yPosition = y + by;
                    if (fillMatrix[xPosition] && fillMatrix[xPosition][yPosition]) {
                        ++filledSpotsInArea;
                    }
                }
            }

            if (filledSpotsInArea > 0) {
                continue;
            }

            for(let bx = -brushRadius; bx <= brushRadius; ++bx) {
                const xPosition = x + bx;
                fillMatrix[xPosition] = fillMatrix[xPosition] || {}
                for(let by = -brushRadius; by <= brushRadius; ++by) {
                    const yPosition = y + by;
                    fillMatrix[xPosition][yPosition] = true;
                }
            }
            result.push([x * resolution, y * resolution]);
            ++printsCount;
        }
    }

    const endTime = Date.now();
    console.log(
        `Overall dots: ${horizontalSteps * verticalSteps}, black: ${blackDotsCount}, prints: ${printsCount}, elapsed time: ${(endTime - startTime) / 1000}, diff time: ${diffTime / 1000}`
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
    },
}