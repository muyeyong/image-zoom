import React, {
  FC,
  useRef,
  useEffect,
  useState,
  useMemo,
} from "react";
import styles from "./ImageZoom.sass";

/* 
 最大放大
 最小缩小
 step:
  实现图片等比缩放
    最大缩放 外界传入？
    最小缩放 外界传入？
    缩放间距 外界传入？ 可以设置成动态的？
    设置过度效果
 */
interface Props {
  src: string;
  maxScale?: number
  minScale?: number
  scaleStep?: number
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
  width: number;
  height: number;
}

const INIT_MATRIX = {
  a: 1,
  b: 0,
  c: 0,
  d: 1,
  e: 0,
  f: 0,
};

const DEFAULT_MAX_SCALE = 9.9
const DEFAULT_MIN_SCALE = 0.1
const DEFULT_SCALE_STEP = 0.1

const ImageZoom: FC<Props> = (props) => {
  const [matrix, setMatrix] = useState<IMatrix>({ ...INIT_MATRIX });
  const currRootEleRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);



  const imgStyle = useMemo(() => {
    return {
      width: '100%',
      height: '100%',
      transform: `matrix(
      ${matrix.a},
      ${matrix.b},
      ${matrix.c},
      ${matrix.d},
      ${matrix.e},
      ${matrix.f}
      )`,
    };
  }, [matrix]);

  const imageAdaptation = (
    parentMeasurement: IMeasurement,
    childMeasurement: IMeasurement
  ) => {
    const widthScale = parentMeasurement.width / childMeasurement.width;
    const heightScale = parentMeasurement.height / childMeasurement.height;
    if (widthScale < 1 || heightScale < 1) {
      const minScale = Math.max(widthScale, heightScale);
      setMatrix((pre) => ({ ...pre, a: minScale, d: minScale }));
    }
  };

  const imgLoad = () => {
    const { clientWidth, clientHeight } = currRootEleRef.current?.parentElement;
    const { width, height } = imgRef.current;
    imageAdaptation(
      { width: clientWidth, height: clientHeight },
      { width, height }
    );
  };

  const enLargeImage = () => {
    const maxScale = props.maxScale??DEFAULT_MAX_SCALE
    const scaleStep = props.scaleStep??DEFULT_SCALE_STEP
    setMatrix(pre => {
      const newAD = pre.a + scaleStep > maxScale ? maxScale : pre.a + scaleStep
      return { ...pre, a: newAD, d: newAD }
    })
  }
  const shrinkImage = () => {
    const minScale = props.minScale??DEFAULT_MIN_SCALE
    const scaleStep = props.scaleStep??DEFULT_SCALE_STEP
    setMatrix(pre => {
      const newAD = pre.a - scaleStep < minScale ? minScale : pre.a - scaleStep
      return { ...pre, a: newAD, d: newAD }
    })
  }

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) { // 放大
      enLargeImage()
    } else if (e.deltaY > 0) { // 缩小
      shrinkImage()
    }
  }

  useEffect(() => {
    currRootEleRef.current?.addEventListener('wheel', handleWheel, {
      passive: false
    })
    return () => {
      currRootEleRef.current?.removeEventListener('wheel', handleWheel)
    }
  }, [])
  return (
    <div ref={currRootEleRef}>
      <img
        src={props.src}
        alt="图片"
        style={imgStyle}
        onLoad={imgLoad}
        ref={imgRef}
      />
    </div>
  );
};

export default ImageZoom;
