import './App.css';
import ImageZoom from './component/ImageZoom.tsx';
import ToolsBar from './component/ToolsBar.tsx';

function App() {
  return (
    <div className="App" style={{ border: '1px solid red'}}>
     <ImageZoom 
      src={require('./assets/DJI_0926.jpeg')} 
      toolbarRender={(args) => <ToolsBar {...args}/>}>
     </ImageZoom>
    </div>
  );
}

export default App;
