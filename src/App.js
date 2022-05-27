import './App.css';
import ImageZoom from './component/ImageZoom.tsx';
import ToolsBar from './component/ToolsBar.tsx';
import { PhotoView } from './react-photo-view'

function App() {
  return (
    <div className="App" style={{ border: '1px solid red'}}>
     {/* <ImageZoom 
      src={require('./assets/DJI_0926.jpeg')} 
      toolbarRender={(args) => <ToolsBar {...args}/>}>
     </ImageZoom> */}
     <PhotoView src={require('./assets/DJI_0926.jpeg')}>
       <img src={require('./assets/DJI_0926.jpeg')} alt='图片' />
     </PhotoView>
    </div>
  );
}

export default App;
