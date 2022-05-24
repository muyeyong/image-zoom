import './App.css';
import ImageZoom from './component/ImageZoom.tsx';

function App() {
  return (
    <div className="App" style={{ border: '1px solid red'}}>
     <ImageZoom src={require('./assets/DJI_0926.jpeg')}></ImageZoom>
    </div>
  );
}

export default App;
