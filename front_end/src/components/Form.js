import React, { useState } from "react";

function Form() {
  const [textTrack, setTextTrack] = useState("");

  function handleChange(e) {
    console.log("render");
    setTextTrack(e.target.value);
  }

  return (
    <div className="App">
      <div>
        <label htmlFor="text">Text </label>
        <input type="text" id="text" name="text" />
      </div>

      <div>
        <label htmlFor="text">Text track</label>
        <input
          type="text"
          id="textTrack"
          name="textTrack"
          value={textTrack}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="textArea">TextArea </label>
        <textarea type="text" id="textArea" name="textArea"></textarea>
      </div>

      <div>
        <label>Select </label>
        <select id="select" name="select">
          <option>Option 1</option>
          <option>Option 2</option>
          <option>Option 3</option>
        </select>
        {/* {select} */}
      </div>

      <div>
        <label>Select multiple </label>
        <select id="selectMultiple" name="selectMultiple" multiple>
          <option>Option 1</option>
          <option>Option 2</option>
          <option>Option 3</option>
        </select>
        {/* {selectMultiple} */}
      </div>

      <div>
        <label>Checkbox </label>
        <input id="checkbox" name="checkbox" type="checkbox"></input>
        {/* {checkbox ? <span>Checked !</span> : null} */}
      </div>
    </div>
  );
}

export default Form;
