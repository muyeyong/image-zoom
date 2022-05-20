import React, { FC, useRef, useEffect, useState, useMemo, useLayoutEffect } from "react";
import styles from "./ImageZoom.sass";


/* 
 最大放大
 最小缩小
 step:
  实现图片等比缩放
 */
interface Props {
  src: string;
}

interface IMatrix {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}
interface IMeasurement {
  width: number
  height: number
}

const INIT_MATRIX = {
  a: 1,
  b: 0,
  c: 0,
  d: 1,
  e: 0,
  f: 0,
};



const ImageZoom: FC<Props> = (props) => {
  const [matrix, setMatrix] = useState<IMatrix>({ ...INIT_MATRIX });
  const currRootEleRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null)

  const imgStyle = useMemo(() => {
    return {  transform: `matrix(
      ${matrix.a},
      ${matrix.b},
      ${matrix.c},
      ${matrix.d},
      ${matrix.e},
      ${matrix.f}
      )`
    }
  }, [matrix])

  const imageAdaptation = (parentMeasurement: IMeasurement, childMeasurement: IMeasurement) => {
    const widthScale = parentMeasurement.width / childMeasurement.width
    const heightScale = parentMeasurement.height / childMeasurement.height  
    if (widthScale < 1 || heightScale < 1) {
      const minScale = Math.max(widthScale, heightScale)
      setMatrix(pre => ({ ...pre, a: minScale, d:  minScale}))
    }
  }

  useLayoutEffect(() => {
   const { clientWidth, clientHeight } = currRootEleRef.current?.parentElement
   const { width, height } = imgRef.current
   imageAdaptation({width: clientWidth, height: clientHeight}, { width, height})
  }, [])
  return (
    <div ref={currRootEleRef}>
      <img src={props.src} alt="图片" style={imgStyle} ref={imgRef}/>
    </div>
  );
};

export default ImageZoom;
