import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  RefObject
} from 'react'

interface Props {
  src: string
  maxScale?: number
  minScale?: number
  scaleStep?: number
  duration?: number
  ref?: RefObject<any>
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

export interface ImageZoomForward {
  matrix: IMatrix
  enLargeImage: () => void
  shrinkImage: () => void
  imageAdaptation: () => void
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

const ImageZoom: ForwardRefRenderFunction<ImageZoomForward, Props> = (props, ref) => {
  const [matrix, setMatrix] = useState<IMatrix>({ ...INIT_MATRIX })
  const [duration, setDuration] = useState<number>(props.duration ?? DEFAULT_DURATION)
  const [mouseDown, setMouseDown] = useState<boolean>(false)
  const [moveStartPoint, setMoveStartPoint] = useState<Point>({ x: 0, y: 0 })
  const [perfectScale, setPerfectScale] = useState<number>(1)
  const currRootEleRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const canMove = useMemo(() => {
    if (!imgRef.current || !currRootEleRef.current) return false
    return (matrix.a * imgRef.current?.clientWidth > currRootEleRef.current?.clientWidth) ||
    (matrix.d * imgRef.current?.clientHeight > currRootEleRef.current?.clientHeight)
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
      )`,
      cursor: canMove ? 'grab' : ''
    }
  }, [matrix, duration, canMove])

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
    setMatrix((pre) => ({ ...pre, a: scale, d: scale }))
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
      const xMaxOffset = Math.abs((pre.a * imgRef.current?.clientWidth) - currRootEleRef.current?.parentElement.clientWidth) / 2
      const yMaxOffset = Math.abs((pre.d * imgRef.current?.clientHeight) - currRootEleRef.current?.parentElement.clientHeight) / 2
      const getOffset = (currVal: number, extremumVal: number) => {
        if (extremumVal <= 0) return currVal
        if (currVal > extremumVal) return extremumVal
        if (currVal < -extremumVal) return -extremumVal
        return currVal
      }
      const xOffset = getOffset(pre.e + (e.clientX - moveStartPoint.x), xMaxOffset)
      const yOffset = getOffset(pre.f + (e.clientY - moveStartPoint.y), yMaxOffset)
      return { ...pre, e: xOffset, f: yOffset }
    })
    setMoveStartPoint({ x: e.clientX, y: e.clientY })
  }, [canMove, mouseDown, moveStartPoint])

  useEffect(() => {
    currRootEleRef.current?.addEventListener('wheel', handleWheel, {
      passive: false
    })
    return () => {
      currRootEleRef.current?.removeEventListener('wheel', handleWheel)
    }
  }, [])

  useImperativeHandle(ref, () => ({
    matrix: matrix,
    shrinkImage: shrinkImage,
    enLargeImage: enLargeImage,
    imageAdaptation: () => setMatrix(pre => ({ ...pre, a: perfectScale, d: perfectScale }))
  }))
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
    </div>
  )
}

export default forwardRef(ImageZoom)
