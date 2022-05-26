import {
  MinusOutlined,
  PlusOutlined,
  ExpandOutlined,
  RedoOutlined
} from '@ant-design/icons'
import { Tooltip } from 'antd'

import { FC } from 'react'
import './ToolsBar.css'
import { ToolbarRenderProps } from './ImageZoom'

interface Props extends Partial<ToolbarRenderProps> {
 
}

const ToolsBar: FC<Props> = (props) => {
  const {
    shrinkImage, matrix, imageAdaptation, enLargeImage, rotateImage
  } = props
  return (
    <div
      className={'tool-bar'}
    >
      <MinusOutlined
        className={'tool-bar-zoom'}
        onClick={() => shrinkImage && shrinkImage()}
      />

      <span className={'toolBar__span'}>
        <span className={'toolBar-span-title'}>
          {((matrix?.a || 1) * 100).toFixed(0)}%
        </span>
        <Tooltip
          placement="top"
          title={'适应屏幕'}
        >
          <ExpandOutlined
            className={'toolBar-span-icon'}
            onClick={() => imageAdaptation && imageAdaptation()}
          />
        </Tooltip>
      </span>

      <PlusOutlined
        className={'toolBar__zoom'}
        onClick={() => enLargeImage && enLargeImage()}
      />

      <RedoOutlined
        onClick={() => rotateImage && rotateImage(90)}
       />

    </div>
  )
}

export default ToolsBar
