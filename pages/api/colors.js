import Jimp from 'jimp'
import {prepareBase64ForJimp} from "../../lib/base64";

export default async function handler(req, res) {
    if (req.body.base64) {
        await Jimp.read(Buffer.from(prepareBase64ForJimp(req.body.base64), 'base64')).then(function (lenna) {
            const width = lenna.bitmap.width;
            const height = lenna.bitmap.height;
            const colors = new Set();
            for(let x = 0; x < width; ++x) {
                for(let y = 0; y < height; ++y) {
                    const color = lenna.getPixelColor(x, y);
                    colors.add(color);
                }
            }
            const colorsSlice = Array.from(colors).slice(0, 5);
            const rgbaColors = colorsSlice.map((color) => {
                const rgba = Jimp.intToRGBA(color);
                return `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;
            })
            res.status(200).json({colors: rgbaColors, total: colors.size});
        })
    } else {
        console.log('body was:', JSON.stringify(req.body));
    }
}
