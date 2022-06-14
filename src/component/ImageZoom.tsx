import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
  FC
} from 'react'


interface Props {
  src: string
  toolbarRender: (args: ToolbarRenderProps) => React.ReactNode
  maxScale?: number
  minScale?: number
  scaleStep?: number
  duration?: number
}

interface Point {
  x: number
  y: number
}

interface IMatrix {
  a: number
  b: number
  c: number
  d: number
  e: number
  f: number
}
interface IMeasurement {
  width: number
  height: number
}

export interface ToolbarRenderProps {
  matrix: IMatrix
  rotateAngle: number
  enLargeImage: () => void
  shrinkImage: () => void
  imageAdaptation: () => void
  rotateImage:(angle: number) => void
}

const INIT_MATRIX = {
  a: 1,
  b: 0,
  c: 0,
  d: 1,
  e: 0,
  f: 0
}

const DEFAULT_MAX_SCALE = 9.9
const DEFAULT_MIN_SCALE = 0.1
const DEFAULT_SCALE_STEP = 0.1
const DEFAULT_DURATION = 0.3

const ImageZoom:FC<Props> = (props) => {
  const [matrix, setMatrix] = useState<IMatrix>({ ...INIT_MATRIX })
  const [rotateAngle, setRotateAngle] = useState<number>(0)
  const [duration, setDuration] = useState<number>(props.duration ?? DEFAULT_DURATION)
  const [mouseDown, setMouseDown] = useState<boolean>(false)
  const [moveStartPoint, setMoveStartPoint] = useState<Point>({ x: 0, y: 0 })
  const [perfectScale, setPerfectScale] = useState<number>(1)
  const currRootEleRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const canMove = useMemo(() => {
    if (!imgRef.current || !currRootEleRef.current?.parentElement) return false
    return (matrix.a * imgRef.current?.clientWidth > currRootEleRef.current?.parentElement?.clientWidth) ||
    (matrix.d * imgRef.current?.clientHeight > currRootEleRef.current?.parentElement?.clientHeight)
  }, [matrix])

  const imgStyle = useMemo(() => {
    return {
      width: '100%',
      height: '100%',
      transition: `all ${duration}s ease`,
      transform: `matrix(
      ${matrix.a},
      ${matrix.b},
      ${matrix.c},
      ${matrix.d},
      ${matrix.e},
      ${matrix.f}
      ) rotate(${rotateAngle}deg)`,
      cursor: canMove ? 'grab' : ''
    }
  }, [matrix, duration, canMove, rotateAngle])

  const getImagePerfectScale = (
    parentMeasurement: IMeasurement,
    childMeasurement: IMeasurement
  ) => {
    const widthScale = parentMeasurement.width / childMeasurement.width
    const heightScale = parentMeasurement.height / childMeasurement.height
    if (widthScale < 1 || heightScale < 1) {
      return Math.min(widthScale, heightScale)
    } else {
      return 1
    }
  }

  const imgLoad = () => {
    if (!imgRef.current || !currRootEleRef.current?.parentElement) return
    const { clientWidth, clientHeight } = currRootEleRef.current?.parentElement
    const { width, height } = imgRef.current
    const scale = getImagePerfectScale(
      { width: clientWidth, height: clientHeight },
      { width, height }
    )
    setPerfectScale(scale)
    setMatrix((pre) => ({ ...pre, a: scale, d: scale, e: 0, f: 0 }))
  }

  const enLargeImage = () => {
    const maxScale = props.maxScale ?? DEFAULT_MAX_SCALE
    const scaleStep = props.scaleStep ?? DEFAULT_SCALE_STEP
    setMatrix(pre => {
      const newAD = pre.a + scaleStep > maxScale ? maxScale : pre.a + scaleStep
      return { ...pre, a: newAD, d: newAD }
    })
  }
  const shrinkImage = () => {
    const minScale = props.minScale ?? DEFAULT_MIN_SCALE
    const scaleStep = props.scaleStep ?? DEFAULT_SCALE_STEP
    setMatrix(pre => {
      const newAD = pre.a - scaleStep < minScale ? minScale : pre.a - scaleStep
      const eMove = pre.e === 0 ? 0 : pre.e * (scaleStep / (pre.a - 1 >= scaleStep ? pre.a - 1 : scaleStep))
      const fMove = pre.f === 0 ? 0 : pre.f * (scaleStep / (pre.a - 1 >= scaleStep ? pre.a - 1 : scaleStep))
      return { ...pre, a: newAD, d: newAD, e: pre.e - eMove, f: pre.f - fMove }
    })
  }

  const imageAdaptation = () => {
    setMatrix(pre => ({ ...pre, a: perfectScale, d: perfectScale, e: 0, f: 0 }))
  }
  const rotateImage = useCallback((angle: number) => {
    setDuration(DEFAULT_DURATION)
    setRotateAngle(angle)
  }, [])

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    setDuration(props.duration ?? DEFAULT_DURATION)
    if (e.deltaY < 0) {
      enLargeImage()
    } else if (e.deltaY > 0) {
      shrinkImage()
    }
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setMouseDown(true)
    setMoveStartPoint({ x: e.clientX, y: e.clientY })
  }, [])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setMouseDown(false)
  }, [])

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setMouseDown(false)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    if (!canMove || !mouseDown) return
    setDuration(0)
    setMatrix(pre => {
      if (!imgRef.current || !currRootEleRef.current?.parentElement) return pre
      const xMaxOffset = ((pre.a * imgRef.current?.clientWidth) - currRootEleRef.current?.parentElement.clientWidth) / 2
      const yMaxOffset = ((pre.d * imgRef.current?.clientHeight) - currRootEleRef.current?.parentElement.clientHeight) / 2
      const getOffset = (currVal: number, changeVal: number, extremumVal: number) => {
        if (extremumVal <= 0) return currVal
        if (currVal + changeVal > extremumVal) return extremumVal
        if (currVal + changeVal < -extremumVal) return -extremumVal
        return currVal + changeVal
      }
      const xOffset = getOffset(pre.e, (e.clientX - moveStartPoint.x), xMaxOffset)
      const yOffset = getOffset(pre.f, (e.clientY - moveStartPoint.y), yMaxOffset)
      return { ...pre, e: xOffset, f: yOffset }
    })
    setMoveStartPoint({ x: e.clientX, y: e.clientY })
  }, [canMove, mouseDown, moveStartPoint])


  useEffect(() => {
    currRootEleRef.current?.parentElement?.addEventListener('wheel', handleWheel, {
      passive: false
    })
    return () => {
      currRootEleRef.current?.parentElement?.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])
  return (
    <div ref={currRootEleRef}>
      <img
        src={props.src}
        alt="图片"
        style={imgStyle}
        onLoad={imgLoad}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        ref={imgRef}
      />
      {props.toolbarRender({ matrix, shrinkImage, enLargeImage, rotateImage, imageAdaptation, rotateAngle })}
    </div>
  )
}

export default ImageZoom
