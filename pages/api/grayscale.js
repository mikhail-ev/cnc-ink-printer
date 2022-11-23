import Jimp from 'jimp'
import {prepareBase64ForJimp} from "../../lib/base64";

export default async function handler(req, res) {
    if (req.body.base64) {
        Jimp.read(Buffer.from(prepareBase64ForJimp(req.body.base64), 'base64')).then(function (lenna) {
            lenna.quality(60)
                .greyscale()
                .contrast(1)
                .getBase64(Jimp.MIME_JPEG, function (err, src) {
                    res.status(200).json({base64: src});
                });
        })
    } else {
        console.log('body was:', JSON.stringify(req.body));
    }
}
