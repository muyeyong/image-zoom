import './App.css';
import ImageZoom from './component/ImageZoom.tsx';

function App() {
  return (
    <div className="App">
     <ImageZoom src={require('./assets/DJI_0926.jpeg')} />
    </div>
  );
}

export default App;
