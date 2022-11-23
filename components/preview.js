import {useEffect, useState} from "react";

const Preview = ({imageBase64}) => {
    const [colorsInfo, setColorsInfo] = useState(null);
    useEffect(() => {
        if (imageBase64) {
            fetch('/api/colors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({base64: imageBase64})
            }).then((res) => res.json()).then((json) => setColorsInfo(json))
        }
    }, [imageBase64])
    return (
        <div style={{maxWidth: '100%'}}>
            {colorsInfo &&
                <div>
                    <div>Colors used:</div>
                    {colorsInfo.colors.map((color, i) => {
                        return (
                            <div key={`${i}-${color}`}>
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    backgroundColor: color,
                                    display: 'inline-block'
                                }}/>
                                <span>{color}</span>
                            </div>
                        )
                    })}
                    {colorsInfo.total !== colorsInfo.colors.length ? <div>...and {colorsInfo.total} more</div> : null}
                </div>}
            {imageBase64 && <img src={imageBase64} alt="Image preview" style={{maxWidth: '100%'}}/>}
        </div>
    )
}

export default Preview