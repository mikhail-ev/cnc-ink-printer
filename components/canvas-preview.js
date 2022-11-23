import {useEffect} from "react";

const CanvasPreview = ({width, height, zoom, prints, brushSize, showHits}) => {
    useEffect(() => {
            const c = document.getElementById("canvas-preview");
            const ctx = c.getContext("2d");
            if (Array.isArray(prints)) {
                ctx.clearRect(0, 0, width, height);
                prints.forEach(([x, y]) => {
                    ctx.fillStyle = "#000000";
                    ctx.fillRect(x - brushSize / 2, y - brushSize / 2, brushSize, brushSize);
                });
                ctx.fillRect(10, 10, brushSize, brushSize);
                if (showHits) {
                    prints.forEach(([x, y]) => {
                        ctx.fillStyle = "#FF0000";
                        ctx.fillRect(x, y, 1, 1);
                    });
                }
            }
        }, [width, height, zoom, prints, brushSize, showHits]
    );

    return (
        <canvas
            id="canvas-preview"
            width={width}
            height={height}
            style={{border: "1px solid #d3d3d3", maxWidth: '100%'}}>
        </canvas>
    )
}

export default CanvasPreview