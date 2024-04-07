import { useLayoutEffect, useState } from "react";
import rough from 'roughjs';
import React from 'react';
import './App.css';

function App() {

  const [action, setAction] = useState("none");
  const [elements, setElements] = useState([]);
  const [type, setType] = useState("line");
  const [selectedElement, setSelectedElement] = useState(null);

  const generator = rough.generator();



  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);


    elements.forEach((element) => {
      roughCanvas.draw(element.roughElement);
    })


  });

  const getElementAtPosition = (x1, x2) => {
    return elements.find(element => elementExists(x1, x2, element))
  }

  const elementExists = (clientX, clientY, element) => {
      const {x1, y1, x2, y2, type} = element;

      if (type === "rectangle") {
        const maxX = Math.max(x1, x2);
        const minX = Math.min(x1, x2);
        const maxY = Math.max(y1, y2);
        const minY = Math.min(y1, y2);


        return (clientX <= maxX && clientX >= minX && clientY <= maxY && clientY >= minY);
      } else if (type === "line") {

        const a = {x: x1, y: y1}
        const b = {x: x2, y: y2}

        const c = {x: clientX, y: clientY}


        const offset = distance(a,b) - distance(a,c) - distance(c,b);

        return Math.abs(offset) < 1;

      }
    };

  const distance = (a,b) => {
    return Math.sqrt(Math.pow((b.x - a.x),2) + Math.pow((b.y - a.y),2));
  }  

  const getElement = (id, x1, y1, x2, y2, type) => {

    const roughElement = type === "line" ? generator.line(x1, y1, x2, y2) : generator.rectangle(x1, y1, x2 - x1, y2 - y1);
    return ({ id, x1, y1, x2, y2, roughElement, type });
  }

  const handleMouseDown = (event) => {
    const { clientX, clientY } = event;

    if (type === "selection") {
      setAction("selection")
      const element = getElementAtPosition(clientX, clientY)
      const offsetX = clientX - element.x1;
      const offsetY = clientY - element.y1;
      setSelectedElement({...element, offsetX, offsetY})
    } else {
      setAction("drawing");

      
      const element = getElement(elements.length, clientX, clientY, clientX, clientY, type);
      setElements([...elements, element])
    }


  }
  const handleMouseUp = () => {

    setAction("none");

  }


  const updateElement = (id, x1, y1, x2, y2, type) => {
      const updatedElement = getElement(id, x1, y1, x2, y2, type);

      const elementsCopy = [...elements];
      elementsCopy[id] = updatedElement;
      setElements(elementsCopy);
  }


  const handleMouseMove = (event) => {

    const { clientX, clientY } = event;

    if (action === "drawing") {


      const index = elements.length - 1;
      const element = elements[index];
      const { x1, y1, type } = element

      updateElement(index, x1, y1, clientX, clientY, type);
    }
    else if(action === "selection") {
      if(selectedElement) {
        const {id, x1, y1, x2, y2, type, offsetX, offsetY} = selectedElement
        const newX = clientX - offsetX;
        const newY = clientY - offsetY;
        const width = x2 - x1;
        const height = y2 - y1;
        updateElement(selectedElement.id, newX, newY, newX + width, newY + height, type)
      }

    }
    if(type === "selection") {

      event.target.style.cursor = getElementAtPosition(clientX, clientY) ? "move" : "default"
      // do the selection part
    }


  }

  return (
    <div>
      <div className="type">
        <div className="toolbar">
        <div className="tool">
          {/* <div className="icon"><img src="../static/images/line.png"></img></div> */}
          <input
            type="radio"
            id="line"
            name="type"
            checked={type === "line"}
            onChange={() => { setType("line") }}
          />
        </div>
        <div className="tool">
        <div className="icon"></div>
          <input
            type="radio"
            id="rectangle"
            name="type"
            checked={type === "rectangle"}
            onChange={() => { setType("rectangle") }}
          />
        </div>
        <div className="tool">
        <div className="icon"></div>
          <input
            type="radio"
            id="Selection"
            name="type"
            checked={type === "selection"}
            onChange={() => { setType("selection") }}
          />
        </div>
        </div>
      </div>
      <canvas
        id="canvas"
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      ></canvas>
    </div>
  );
}

export default App;
