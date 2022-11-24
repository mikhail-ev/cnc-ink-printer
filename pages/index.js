import Head from 'next/head'
import {useEffect, useState} from "react";
import Preview from "../components/preview";
import ExampleFiles from "../components/example-files";
import CanvasPreview from "../components/canvas-preview";

const ALGORITHMS = {
    DEFAULT: 'DEFAULT'
}

async function getImageGrayscale(base64) {
    const json = await fetch('/api/grayscale', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({base64})
    }).then((res) => res.json());

    return json.base64
}

async function getPrints(base64, algorithm,
                         canvasWidth,
                         canvasHeight,
                         stepResolution,
                         brushSize) {
    const json = await fetch('/api/convolution', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            base64, algorithm, resolution: stepResolution,
            cwidth: canvasWidth, cheight: canvasHeight,
            bsize: brushSize
        })
    }).then((res) => res.json())

    return json.prints;
}

export default function Home() {
    const [originalImage, setOriginalImage] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [applyGrayscale, setApplyGrayscale] = useState(false);
    const [algorithm, setAlgorithm] = useState(ALGORITHMS.DEFAULT);
    const [canvasWidth, setCanvasWidth] = useState(594);
    const [canvasHeight, setCanvasHeight] = useState(841);
    const [stepResolution, setStepResolution] = useState(0.2);
    const [brushSize, setBrushSize] = useState(5);
    const [canvasZoom, setCanvasZoom] = useState(10);
    const [prints, setPrints] = useState(null);
    const [showHits, setShowHits] = useState(true);

    useEffect(() => {
        if (!originalImage) {
            return;
        }
        if (applyGrayscale) {
            getImageGrayscale(originalImage).then((grayscale) => setProcessedImage(grayscale));
        } else {
            setProcessedImage(originalImage)
        }
    }, [originalImage, applyGrayscale]);

    useEffect(() => {
        if (processedImage && algorithm) {
            getPrints(processedImage, algorithm, canvasWidth, canvasHeight, stepResolution, brushSize).then((prints) => setPrints(prints));
        }
    }, [processedImage, algorithm, canvasWidth, canvasHeight, stepResolution, brushSize])

    function handleFileChange(event) {
        if (event.target.files[0]) {
            getBase64(event.target.files[0])
        }
        setOriginalImage(null);
    }

    function handleGrayscaleChange(event) {
        setApplyGrayscale(event.target.checked)
    }

    function getBase64(file) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            console.log(reader.result);
            setOriginalImage(reader.result);
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    }

    return (
        <div>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app"/>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <div>
                <ExampleFiles onSelect={setOriginalImage}/>
                <div>
                    <input type="file" onChange={handleFileChange}/>
                    <label>
                        <input type="checkbox" value={applyGrayscale} onChange={handleGrayscaleChange}/>
                        Apply grayscale
                    </label>
                </div>
            </div>
            <main style={{display: 'flex'}}>
                <div style={{flex: '0 0 33%'}}>
                    <Preview imageBase64={processedImage}/>
                </div>
                <div style={{flex: '0 0 33%'}}>
                    <label>
                        Approx. algorithm:
                        <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
                            <option value={ALGORITHMS.DEFAULT}>
                                Default
                            </option>
                        </select>
                    </label>
                    <div>
                        <div>
                            Canvas:
                            <input type="number" value={canvasWidth} style={{width: '50px'}} readOnly/>mm/
                            <input type="number" value={canvasHeight} style={{width: '50px'}} readOnly/>mm
                        </div>
                        <div>
                            Step resolution
                            <input type="number" value={stepResolution} style={{width: '50px'}} readOnly/>mm
                        </div>
                        <div>
                            <label>
                                Show hits
                                <input type="checkbox" checked={showHits} onChange={(e) => setShowHits(e.target.checked)}/>
                            </label>
                        </div>
                    </div>
                    <CanvasPreview width={canvasWidth} height={canvasHeight} zoom={canvasZoom} prints={prints} brushSize={brushSize} showHits={showHits}/>
                </div>
                <div style={{flex: '0 0 33%'}}></div>
            </main>
        </div>
    )
}
